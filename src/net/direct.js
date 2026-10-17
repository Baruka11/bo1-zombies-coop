// Direct links: a WebRTC connection between the host and each guest, used instead of the relay while it works.
//
// The relay stays: it carries the handshake (offers, answers and ICE candidates are ordinary control messages), it is
// the fallback whenever a direct link is missing or drops, and it keeps the room (who is the host, how many seats).
// Over a link go the game packets (an unordered, unreliable channel, like the UDP the engine was written for) and the
// control messages (a reliable one, which also carries the ping).
//
// What a link means for the player: the other end learns their IP address, which the relay otherwise hides. So links
// can be switched off (setEnabled), and nothing of WebRTC is touched while they are off.
//
// What a peer can do to us over a link is kept as small as over the relay:
//  - handshake messages are checked before they reach the browser's WebRTC code (size, shape, only a data-channel
//    session, a handful of candidates), and only STUN servers from the list below are ever used;
//  - a link belongs to the seat the relay stamped on its offer, one link per seat, and only the two expected channels
//    are accepted;
//  - game frames and control messages are size-checked and counted per second; a peer over the limit loses its link
//    and is not linked again for a while (the relay's own limits then still apply to it);
//  - control messages get the same checks as from the relay: JSON object with a short type, never a relay-only type,
//    and `from` is set here, never taken from the sender.
import { MAX_BINARY_BYTES, MAX_GUESTS, MAX_TEXT_BYTES, isPeerMessage, parseControl } from "../../relay/src/protocol.js";

export const STUN_SERVERS = Object.freeze([{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun.cloudflare.com:3478" }]);

const ATTEMPT_MS = 12000; // a handshake that takes longer is given up
const RETRY_MS = [5000, 30000]; // the guest tries again after these pauses, then stays on the relay
const MIN_OFFER_GAP_MS = 1500; // the host's patience with a seat that keeps offering
const PING_MS = 1000;
const BUFFER_LIMIT = 256 * 1024; // game bytes waiting in a channel; beyond that the packet is dropped, as the network would
const FRAME_LIMIT_PER_S = 1500; // game frames a peer may send us per second (the relay allows 400 per guest)
const CONTROL_LIMIT_PER_S = 200;
const BAN_MS = 60000;
const MAX_SDP_CHARS = 3500; // a whole handshake message must fit in one relay text frame (MAX_TEXT_BYTES)
const MAX_CANDIDATES = 24;
const CANDIDATE_BATCH_MS = 40;
const MAX_ICE_MESSAGE_CHARS = 3000;
const PING_PATTERN = /^[pq]:\d{1,15}(?:\.\d{1,6})?$/;

/** The SDP of a data-channel-only session, or null. Nothing else (audio, video, a pile of lines) is ever negotiated. */
export function checkSdp(sdp) {
  if (typeof sdp !== "string" || sdp.length < 20 || sdp.length > MAX_SDP_CHARS) return null;
  if (!/^[\x20-\x7e\r\n]+$/.test(sdp)) return null;
  const lines = sdp.split(/\r?\n/).filter(Boolean);
  if (lines.length > 80 || !lines[0].startsWith("v=0")) return null;
  const media = lines.filter((line) => line.startsWith("m="));
  if (media.length !== 1 || !/^m=application \d+ UDP\/DTLS\/SCTP webrtc-datachannel$/.test(media[0])) return null;
  if (lines.filter((line) => line.startsWith("a=candidate:")).length > MAX_CANDIDATES) return null;
  return sdp;
}

/** { candidate, sdpMid, sdpMLineIndex } as the browser wants it, or null. */
export function checkCandidate(c) {
  if (!c || typeof c !== "object" || typeof c.candidate !== "string") return null;
  if (c.candidate.length > 300 || !/^candidate:[\x21-\x7e ]+$/.test(c.candidate)) return null;
  const mid = typeof c.sdpMid === "string" && c.sdpMid.length <= 16 ? c.sdpMid : null;
  const index = Number.isInteger(c.sdpMLineIndex) && c.sdpMLineIndex >= 0 && c.sdpMLineIndex <= 1 ? c.sdpMLineIndex : 0;
  return { candidate: c.candidate, sdpMid: mid, sdpMLineIndex: index };
}

const validNonce = (n) => typeof n === "string" && /^[a-z0-9]{6,16}$/.test(n);
const newNonce = () => Array.from(crypto.getRandomValues(new Uint8Array(8)), (b) => (b % 36).toString(36)).join("");

/**
 * @param {object} options
 * @param {"host"|"guest"} options.role
 * @param {boolean} options.enabled  whether links may be made at all (the player's choice)
 * @param {(message: object) => void} options.signal  sends a handshake message to the other side through the relay;
 *   the host's messages carry `to: seat`, and the relay stamps `from` on the guest's
 * @param {(seat: number, data: ArrayBuffer) => void} options.onGame  a game frame arrived (seat 0 is the host)
 * @param {(seat: number, message: object) => void} options.onControl  a control message arrived
 * @param {() => void} [options.onChange]  a link opened or closed
 * @param {() => number[]} [options.seatsPresent]  host: which guests the relay says are in the room
 * @param {() => boolean} [options.hostPresent]  guest: whether the host is in the room
 * @param {object} [options.rtc]  RTCPeerConnection constructor (for tests)
 */
export class DirectLinks {
  constructor(options) {
    this.role = options.role;
    this.enabled = Boolean(options.enabled);
    this.signal = options.signal;
    this.onGame = options.onGame;
    this.onControl = options.onControl;
    this.onChange = options.onChange ?? (() => {});
    this.seatsPresent = options.seatsPresent ?? (() => []);
    this.hostPresent = options.hostPresent ?? (() => false);
    this.rtc = options.rtc ?? globalThis.RTCPeerConnection;
    this.now = options.now ?? (() => Date.now());
    this.links = new Map(); // seat -> link; a guest has only seat 0 (the host)
    this.banned = new Map(); // seat -> until
    this.lastOfferAt = new Map();
    this.failures = new Map(); // seat -> why the last attempt ended, until a link opens
    this.retries = 0;
    this.retryAt = 0;
    this.log = options.log ?? (() => {});
    this.closed = false;
    this.pingTimer = setInterval(() => this.pings(), PING_MS);
  }

  get supported() {
    return typeof this.rtc === "function";
  }

  setEnabled(on) {
    this.enabled = Boolean(on);
    if (!this.enabled) for (const seat of [...this.links.keys()]) this.drop(seat, "turned off");
    else this.retries = 0;
  }

  close() {
    this.closed = true;
    clearInterval(this.pingTimer);
    for (const seat of [...this.links.keys()]) this.drop(seat, "closed");
  }

  /** Called every tick: the guest starts (and restarts) its handshake; both sides drop links whose peer left. */
  tick() {
    if (this.closed) return;
    if (this.role === "guest") {
      if (!this.hostPresent()) {
        if (this.links.has(0)) this.drop(0, "host left");
        return;
      }
      if (this.enabled && this.supported && !this.links.has(0) && this.retries <= RETRY_MS.length && this.now() >= this.retryAt) this.offer();
    } else {
      const present = new Set(this.seatsPresent());
      for (const seat of [...this.links.keys()]) if (!present.has(seat)) this.drop(seat, "guest left");
    }
  }

  // Sending ------------------------------------------------------------------------------------------------------

  /** True when the frame was handed to the seat's link (or deliberately dropped by it): do not also send it by relay. */
  sendGame(seat, data) {
    const link = this.links.get(seat);
    if (!link?.open || link.game.readyState !== "open") return false;
    if (link.game.bufferedAmount <= BUFFER_LIMIT) {
      try {
        link.game.send(data);
      } catch {
        return false;
      }
    }
    return true;
  }

  sendControl(seat, message) {
    const link = this.links.get(seat);
    if (!link?.open || link.ctl.readyState !== "open") return false;
    const text = JSON.stringify(message);
    if (text.length > MAX_TEXT_BYTES) return false;
    try {
      link.ctl.send(text);
    } catch {
      return false;
    }
    return true;
  }

  /** Round trip time over the seat's open link, or null. */
  rtt(seat) {
    const link = this.links.get(seat);
    return link?.open && Number.isFinite(link.rtt) ? link.rtt : null;
  }

  isOpen(seat) {
    return Boolean(this.links.get(seat)?.open);
  }

  openSeats() {
    return [...this.links].filter(([, link]) => link.open).map(([seat]) => seat);
  }

  /** One seat's route, for the card: { state: off | unsupported | open | connecting | refused | failed | idle, rtt?, why? }. */
  status(seat) {
    if (!this.enabled) return { state: "off" };
    if (!this.supported) return { state: "unsupported" };
    const link = this.links.get(seat);
    if (link?.open) return { state: "open", rtt: Number.isFinite(link.rtt) ? link.rtt : null };
    if (link) return { state: "connecting" };
    const why = this.failures.get(seat);
    if (why) return { state: why === "refused" ? "refused" : "failed", why };
    return { state: "idle" };
  }

  /** The direct route's state per seat: "open", "connecting", or absent. */
  summary() {
    const out = {};
    for (const [seat, link] of this.links) out[seat] = { state: link.open ? "open" : "connecting", rtt: link.rtt };
    return out;
  }

  // Handshake ----------------------------------------------------------------------------------------------------

  /** A handshake message from the relay. `message.from` is the sender's seat (host only; stamped by the relay). */
  async onSignal(message) {
    if (this.closed || !message || typeof message !== "object") return;
    if (!this.enabled || !this.supported) {
      // Say so, so a guest does not wait out its handshake timeout and try again and again.
      if (this.role === "host" && message.k === "offer" && Number.isInteger(message.from) && validNonce(message.n)) this.signal({ t: "rtc", k: "no", n: message.n, to: message.from });
      return;
    }
    try {
      if (this.role === "host") await this.hostSignal(message);
      else await this.guestSignal(message);
    } catch (error) {
      this.log(`direct: handshake failed: ${error?.message ?? error}`);
    }
  }

  async hostSignal(message) {
    const seat = message.from;
    if (!Number.isInteger(seat) || seat < 1 || seat > MAX_GUESTS || !this.seatsPresent().includes(seat)) return;
    if ((this.banned.get(seat) ?? 0) > this.now()) return;
    if (message.k === "offer") {
      const sdp = checkSdp(message.sdp);
      if (!sdp || !validNonce(message.n)) return;
      const existing = this.links.get(seat);
      if (existing?.nonce === message.n) return; // the same offer again
      if (this.now() - (this.lastOfferAt.get(seat) ?? 0) < MIN_OFFER_GAP_MS) return;
      this.lastOfferAt.set(seat, this.now());
      if (existing) this.drop(seat, "new offer", false);
      const link = this.create(seat, message.n);
      await link.pc.setRemoteDescription({ type: "offer", sdp });
      link.remoteSet = true;
      await this.flushRemoteCandidates(link);
      const answer = await link.pc.createAnswer();
      if (this.links.get(seat) !== link) return;
      await link.pc.setLocalDescription(answer);
      this.signal({ t: "rtc", k: "answer", n: link.nonce, to: seat, sdp: link.pc.localDescription.sdp });
    } else if (message.k === "ice") {
      await this.remoteCandidates(this.links.get(seat), message);
    }
  }

  async guestSignal(message) {
    const link = this.links.get(0);
    if (!link || message.n !== link.nonce) return; // stale: from an attempt we already gave up
    if (message.k === "answer") {
      const sdp = checkSdp(message.sdp);
      if (!sdp || link.remoteSet) return;
      await link.pc.setRemoteDescription({ type: "answer", sdp });
      link.remoteSet = true;
      await this.flushRemoteCandidates(link);
    } else if (message.k === "ice") {
      await this.remoteCandidates(link, message);
    } else if (message.k === "no") {
      this.drop(0, "host does not take direct links");
      this.failures.set(0, "refused");
      this.retries = RETRY_MS.length + 1;
    }
  }

  async remoteCandidates(link, message) {
    if (!link || message.n !== link.nonce || !Array.isArray(message.cs)) return;
    for (const raw of message.cs.slice(0, MAX_CANDIDATES)) {
      const candidate = checkCandidate(raw);
      if (!candidate || link.received >= MAX_CANDIDATES) continue;
      link.received += 1;
      link.diag.remote += 1;
      if (link.remoteSet) {
        try {
          await link.pc.addIceCandidate(candidate);
        } catch {
          // a candidate the browser does not like: the others may still work
        }
      } else {
        link.pending.push(candidate);
      }
    }
  }

  async flushRemoteCandidates(link) {
    const pending = link.pending.splice(0);
    for (const candidate of pending) {
      try {
        await link.pc.addIceCandidate(candidate);
      } catch {
        // see remoteCandidates
      }
    }
  }

  async offer() {
    const link = this.create(0, newNonce());
    link.game = link.pc.createDataChannel("game", { ordered: false, maxRetransmits: 0 });
    link.ctl = link.pc.createDataChannel("ctl", { ordered: true });
    this.wireChannel(link, link.game, "game");
    this.wireChannel(link, link.ctl, "ctl");
    try {
      const offer = await link.pc.createOffer();
      if (this.links.get(0) !== link) return;
      await link.pc.setLocalDescription(offer);
      this.signal({ t: "rtc", k: "offer", n: link.nonce, sdp: link.pc.localDescription.sdp });
    } catch (error) {
      this.log(`direct: could not make an offer: ${error?.message ?? error}`);
      this.drop(0, "offer failed");
    }
  }

  create(seat, nonce) {
    const pc = new this.rtc({ iceServers: STUN_SERVERS, bundlePolicy: "max-bundle", iceCandidatePoolSize: 0 });
    const link = {
      seat, pc, nonce, game: null, ctl: null, open: false, remoteSet: false, pending: [], received: 0, outgoing: [], batchTimer: null,
      rtt: null, frames: 0, controls: 0, windowAt: this.now(), timer: null,
      // What the handshake looked like, for the report: the kinds of address we found, how many the other side sent.
      diag: { ice: "new", local: { host: 0, srflx: 0, prflx: 0, relay: 0 }, remote: 0 },
    };
    this.links.set(seat, link);
    link.timer = setTimeout(() => {
      if (!link.open && this.links.get(seat) === link) this.drop(seat, `no link in time|${this.timeoutKind(link)}`);
    }, ATTEMPT_MS);
    pc.oniceconnectionstatechange = () => {
      if (this.links.get(seat) !== link) return;
      link.diag.ice = pc.iceConnectionState;
      this.log(`direct: ice ${pc.iceConnectionState} (${seat === 0 ? "the host" : `player ${seat + 1}`})`);
    };
    pc.onicecandidate = ({ candidate }) => {
      if (!candidate || this.links.get(seat) !== link) return;
      const kind = candidate.type ?? /typ (\w+)/.exec(candidate.candidate)?.[1];
      if (kind in link.diag.local) link.diag.local[kind] += 1;
      link.outgoing.push({ candidate: candidate.candidate, sdpMid: candidate.sdpMid, sdpMLineIndex: candidate.sdpMLineIndex });
      link.batchTimer ??= setTimeout(() => this.sendCandidates(link), CANDIDATE_BATCH_MS);
    };
    pc.onconnectionstatechange = () => {
      if (this.links.get(seat) === link && ["failed", "closed"].includes(pc.connectionState)) this.drop(seat, `connection ${pc.connectionState}`);
    };
    // Only the guest creates channels. The host accepts exactly one "game" and one "ctl" and closes anything else.
    pc.ondatachannel = ({ channel }) => {
      if (this.links.get(seat) !== link || this.role !== "host") return channel.close();
      const kind = channel.label;
      if ((kind !== "game" && kind !== "ctl") || link[kind]) return channel.close();
      link[kind] = channel;
      this.wireChannel(link, channel, kind);
    };
    return link;
  }

  /** Candidates go out in messages that each fit a relay text frame (the relay closes the connection of a bigger one). */
  /**
   * Why a handshake that took too long probably failed, from what it gathered: "stun" when no public address was found
   * (UDP to the STUN servers is blocked: a VPN, a firewall, a browser privacy setting), "silent" when the other side
   * sent no addresses at all, "nat" when both sides had some but the two networks could not reach each other.
   */
  timeoutKind(link) {
    const { local, remote } = link.diag;
    if (!local.srflx && !local.relay) return "stun";
    if (!remote) return "silent";
    return "nat";
  }

  sendCandidates(link) {
    link.batchTimer = null;
    if (this.links.get(link.seat) !== link) return;
    const send = (cs) => this.signal({ t: "rtc", k: "ice", n: link.nonce, cs, ...(this.role === "host" ? { to: link.seat } : {}) });
    let batch = [];
    let size = 0;
    for (const c of link.outgoing.splice(0, MAX_CANDIDATES)) {
      const bytes = JSON.stringify(c).length + 1;
      if (batch.length && size + bytes > MAX_ICE_MESSAGE_CHARS) {
        send(batch);
        batch = [];
        size = 0;
      }
      batch.push(c);
      size += bytes;
    }
    if (batch.length) send(batch);
  }

  // Channels -----------------------------------------------------------------------------------------------------

  wireChannel(link, channel, kind) {
    channel.binaryType = "arraybuffer";
    channel.onopen = () => this.maybeOpen(link);
    channel.onclose = () => {
      if (this.links.get(link.seat) === link) this.drop(link.seat, `${kind} channel closed`);
    };
    channel.onerror = () => {};
    channel.onmessage = ({ data }) => (kind === "game" ? this.gameFrame(link, data) : this.controlFrame(link, data));
    if (channel.readyState === "open") this.maybeOpen(link);
  }

  maybeOpen(link) {
    if (link.open || this.links.get(link.seat) !== link || link.game?.readyState !== "open" || link.ctl?.readyState !== "open") return;
    link.open = true;
    this.failures.delete(link.seat);
    clearTimeout(link.timer);
    if (link.seat === 0) this.retries = 0;
    this.log(`direct: link to ${link.seat === 0 ? "the host" : `player ${link.seat + 1}`} is open`);
    this.onChange();
  }

  /** A peer over its allowance loses its link and is left to the relay (which has its own limits) for a while. */
  within(link, counter, limit) {
    const now = this.now();
    if (now - link.windowAt >= 1000) {
      link.windowAt = now;
      link.frames = 0;
      link.controls = 0;
    }
    link[counter] += 1;
    if (link[counter] <= limit) return true;
    this.banned.set(link.seat, now + BAN_MS);
    this.drop(link.seat, "sending too much");
    return false;
  }

  gameFrame(link, data) {
    if (!(data instanceof ArrayBuffer) || data.byteLength < 4 || data.byteLength > MAX_BINARY_BYTES || !link.open) return;
    if (!this.within(link, "frames", FRAME_LIMIT_PER_S)) return;
    this.onGame(link.seat, data);
  }

  controlFrame(link, data) {
    if (typeof data !== "string" || data.length > MAX_TEXT_BYTES || !link.open) return;
    if (!this.within(link, "controls", CONTROL_LIMIT_PER_S)) return;
    if (PING_PATTERN.test(data)) {
      if (data[0] === "p") this.sendRaw(link, `q${data.slice(1)}`);
      else {
        const rtt = performance.now() - Number(data.slice(2));
        link.rtt = rtt >= 0 && rtt < 10000 ? rtt : null;
      }
      return;
    }
    const message = parseControl(data);
    if (!message || !isPeerMessage(message) || message.t === "rtc") return;
    delete message.from;
    delete message.to;
    this.onControl(link.seat, this.role === "host" ? { ...message, from: link.seat } : message);
  }

  sendRaw(link, text) {
    try {
      if (link.ctl?.readyState === "open") link.ctl.send(text);
    } catch {
      // closing
    }
  }

  pings() {
    for (const link of this.links.values()) if (link.open) this.sendRaw(link, `p:${performance.now().toFixed(3)}`);
  }

  // Ending -------------------------------------------------------------------------------------------------------

  drop(seat, why, retry = true) {
    const link = this.links.get(seat);
    if (!link) return;
    this.links.delete(seat);
    clearTimeout(link.timer);
    clearTimeout(link.batchTimer);
    for (const channel of [link.game, link.ctl]) {
      if (!channel) continue;
      channel.onopen = channel.onclose = channel.onmessage = channel.onerror = null;
    }
    try {
      link.pc.onicecandidate = link.pc.onconnectionstatechange = link.pc.oniceconnectionstatechange = link.pc.ondatachannel = null;
      link.pc.close();
    } catch {
      // already closed
    }
    const { ice, local, remote } = link.diag;
    this.log(`direct: link to ${seat === 0 ? "the host" : `player ${seat + 1}`} ended (${why}) [ice ${ice}; our addresses: host ${local.host}, public ${local.srflx}, relay ${local.relay}; theirs: ${remote}]`);
    // Ending on purpose (turned off, someone left, a newer offer) is not a failure to report.
    if (!/^(turned off|closed|host left|guest left|new offer|host does not)/.test(why)) this.failures.set(seat, why);
    if (this.role === "guest" && retry && this.enabled && !why.startsWith("host")) {
      this.retryAt = this.now() + (RETRY_MS[this.retries] ?? RETRY_MS.at(-1));
      this.retries += 1;
    }
    if (link.open) this.onChange();
  }
}
