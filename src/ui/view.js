// Turns the session into the card's view model: a header chip, a list of blocks, and the compact pill shown while
// playing. Pure function of the session (plus the page's screen), recomputed every tick.
import { LANGUAGES, savedLanguage } from "./strings.js";
import { MAX_GUESTS } from "../../relay/src/protocol.js";
import { currentHorde, currentSlug, currentZone, MAP_NAMES, MAP_SLUGS, screen as pageScreen } from "../game/page.js";
import { AIM_SPEEDS } from "../input/gamepad.js";
import { guestRoster, hostRoster } from "../session/lobby.js";
import { validSeat } from "../session/session.js";
import { DEFAULT_RELAY } from "../util/relay.js";
import { cleanName } from "../util/settings.js";
import { isNewer } from "../util/updates.js";
import { T } from "./strings.js";
import { funAvailable, funSection } from "../fun/fun.js";

const COPIED_MS = 2000;
const CONNECTED = ["ingame", "ready", "lobby"];
const ON_THE_WAY = ["joining", "turn", "loading", "opening", "reconnecting"];

export function view(session) {
  const screen = pageScreen();
  const playing = screen === "playing" && !session.engine?.menuOpen();
  const blocks = [];
  if (session.error) blocks.push({ kind: "callout", tone: "bad", text: session.error });
  if (session.notice) blocks.push({ kind: "callout", tone: "info", text: session.notice });
  if (session.overQuota) {
    const at = session.overQuota.resetsAt ? new Date(session.overQuota.resetsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : null;
    blocks.push({ kind: "callout", tone: "bad", text: T.relayOverQuota(at), buttons: [{ act: "openRelayGuide", label: T.relayGuide, style: "primary" }, { act: "editRelayNow", label: T.changeRelay }] });
  }
  if (session.update) blocks.push({ kind: "callout", tone: "ok", text: T.updateAvailable(session.update.version), buttons: [{ act: "openUpdate", label: T.updateHow, style: "primary" }] });
  if (!session.mode) return soloView(session, blocks, playing);

  const hosting = session.mode === "host";
  const roster = hosting ? hostRoster(session).players : guestRoster(session);
  const chip = hosting ? hostSection(session, blocks, roster, screen) : guestSection(session, blocks, screen);

  const me = hosting ? 1 : validSeat(session.seat) ? session.seat + 1 : 0;
  const connected = roster.filter((p) => CONNECTED.includes(p.status)).length;
  blocks.push({ kind: "players", label: T.players, aside: T.playersAside(connected, MAX_GUESTS + 1), players: playerRows(session, roster, me) });

  const actions = [];
  if (!hosting && session.phase === "connected" && session.hostPos) actions.push({ act: "goToHost", label: T.goToHost });
  actions.push({ act: "leave", label: T.leave, style: "ghost" });
  blocks.push({ kind: "buttons", buttons: actions });
  if (funAvailable(session)) blocks.push(funSection(session));
  blocks.push(settingsSection(session, true));

  const pill = {
    players: roster.map((p) => ({ n: p.n, on: CONNECTED.includes(p.status) })),
    texts: [session.paused ? T.chip.paused : `${directMark(session)}${pingText(session)}`, ...(session.gamepad?.status === "active" ? ["\u{1F3AE}"] : [])],
  };
  return { chip, tagline: `${T.room} ${session.room}`, blocks, compact: playing && !session.error, pill };
}

function soloView(session, blocks, playing) {
  blocks.push({ kind: "text", cls: "muted", text: T.intro });
  blocks.push({ kind: "buttons", buttons: [{ act: "host", label: T.host, style: "primary" }] });
  blocks.push({ kind: "input", label: T.joinLabel, field: "join", placeholder: T.joinPlaceholder, act: "join", button: T.join });
  if (onSharedRelay(session)) blocks.push({ kind: "callout", tone: "info", text: T.relayPitch, buttons: relayButtons() });
  if (session.engine) blocks.push(funSection(session));
  blocks.push(settingsSection(session, false));
  const pill = session.gamepad?.status === "active" ? { texts: ["\u{1F3AE}"] } : null;
  return { chip: { text: T.chip.solo }, tagline: T.tagline, blocks, compact: playing && !session.error && !session.notice, pill };
}

function hostSection(session, blocks, roster, screen) {
  const freeSeats = roster.filter((p) => p.status === "free").length;
  const onTheWay = roster.some((p) => !p.host && ON_THE_WAY.includes(p.status));
  const mapOpen = Boolean(session.engine) || screen === "loading" || screen === "download";
  const step = screen === "playing" ? 3 : screen === "ready" ? 2 : mapOpen ? 1 : 0;

  const linkCopied = Date.now() - session.copiedLinkAt < COPIED_MS;
  const codeCopied = Date.now() - session.copiedCodeAt < COPIED_MS;
  blocks.push({
    kind: "room",
    label: T.room,
    aside: T.inviteAside(freeSeats),
    code: session.room,
    buttons: [
      { act: "copyLink", label: linkCopied ? T.copied : T.copy, style: linkCopied ? "done" : "primary" },
      { act: "copyCode", label: codeCopied ? T.copied : T.copyCode, style: codeCopied ? "done" : "" },
    ],
  });
  blocks.push({ kind: "steps", steps: T.stepsHost, current: step });

  if (!mapOpen) blocks.push({ kind: "callout", tone: "info", text: T.pickMap });
  else if (session.gate) blocks.push({ kind: "callout", tone: "wait", text: T.gate, buttons: [{ act: "startNow", label: T.startNow }] });
  else if (screen === "ready" && !onTheWay && roster.some((p) => !p.host && p.status === "ready")) blocks.push({ kind: "callout", tone: "ok", text: T.allIn });
  else if (onTheWay && screen === "playing") blocks.push({ kind: "callout", tone: "info", text: T.latecomers });
  if (session.paused) blocks.push({ kind: "callout", tone: "wait", text: session.menuOpen ? T.pausedYou : T.pausedBy });
  if (onSharedRelay(session) && screen !== "playing") blocks.push({ kind: "callout", tone: "info", text: T.relayPitchHost, buttons: relayButtons() });

  blocks.push(mapBlock(MAP_SLUGS[session.zone ?? currentZone()] ?? null, currentHorde(), T.mapSubHost));

  if (session.error) return { text: T.chip.error, tone: "bad" };
  if (session.paused) return { text: T.chip.paused, tone: "wait" };
  return screen === "playing" ? { text: T.chip.ingame, tone: "ok live" } : { text: T.chip.hosting, tone: "wait live" };
}

const GUEST_STEP = { "joining-room": 0, following: 1, loading: 2, "waiting-host": 3, freezing: 3, connect: 3, challenging: 3, joining: 3, connected: 4 };

function guestSection(session, blocks, screen) {
  const phase = session.phase;
  const failed = ["ended", "failed"].includes(phase);
  const slug = session.lobby?.slug ?? session.hostInfo?.slug ?? null;
  const mapName = slug ? MAP_NAMES[slug] : null;
  let step = GUEST_STEP[phase] ?? session.lastStep ?? 0;
  if (phase === "joining-room" && session.hostInfo?.slug) step = 1;
  if (!failed) session.lastStep = step;

  if (session.inviteRelay && session.inviteRelay !== session.relay) {
    blocks.push({ kind: "callout", tone: "wait", text: T.otherRelay(new URL(session.inviteRelay).hostname), buttons: [{ act: "useInviteRelay", label: T.useRelay, style: "primary" }] });
  }
  blocks.push({ kind: "steps", steps: T.stepsGuest, current: step, fail: failed });

  const onHostMap = session.hostInfo?.slug && currentSlug() === session.hostInfo.slug;
  if ((phase === "loading" || (phase === "joining-room" && onHostMap)) && screen === "landing") {
    blocks.push({ kind: "callout", tone: "wait", title: "⌨", text: T.pressKey });
  } else {
    const text = guestMessage(session, phase, mapName, screen);
    if (text) blocks.push({ kind: "callout", tone: failed ? "bad" : phase === "connected" ? "ok" : "info", text, buttons: failed ? [{ act: "rejoin", label: T.rejoin, style: "primary" }] : [] });
  }
  if (session.joinedLate && ["joining", "connected"].includes(phase)) blocks.push({ kind: "callout", tone: "info", text: T.lateJoin });
  if (phase === "connected" && session.paused) blocks.push({ kind: "callout", tone: "wait", text: session.menuOpen ? T.pausedYou : T.pausedBy });
  blocks.push(mapBlock(slug, session.lobby?.horde ?? session.hostInfo?.horde, T.mapSubGuest));

  if (session.error) return { text: T.chip.error, tone: "bad" };
  if (failed) return { text: T.chip.ended, tone: "bad" };
  if (session.paused) return { text: T.chip.paused, tone: "wait" };
  if (phase === "connected") return screen === "playing" ? { text: T.chip.ingame, tone: "ok live" } : { text: T.chip.lobby, tone: "ok" };
  return { text: T.chip.joining, tone: "wait live" };
}

function guestMessage(session, phase, mapName, screen) {
  switch (phase) {
    case "joining-room":
      return session.peer ? (mapName ? T.opening(mapName) : T.hostPicking) : T.waitingHost;
    case "following":
      return T.opening(mapName ?? "…");
    case "loading":
      return T.loadingMap;
    case "waiting-host":
      if (session.hostState?.ready && !session.hostState.turn) return T.nextInLine;
      return session.peer ? T.hostLoading : T.waitingHost;
    case "freezing":
    case "connect":
    case "challenging":
      return T.connecting;
    case "joining":
      return T.joiningGame;
    case "connected":
      if (screen === "playing") return null;
      return session.hostState?.screen === "playing" || (screen === "ready" && session.lobby?.playing) ? T.clickToPlay : T.waitingStart;
    case "ended":
      return T.ended;
    case "failed":
      return T.failed;
    default:
      return null;
  }
}

function playerRows(session, roster, me) {
  return roster.map((p) => {
    const n = Number(p.n);
    const empty = p.status === "free";
    const tags = [];
    if (p.host) tags.push({ cls: "host", text: T.hostTag });
    if (n === me) tags.push({ cls: "you", text: T.you });
    if (!empty && !p.host && (p.route === "direct" || p.route === "relay")) tags.push({ cls: p.route, text: p.route === "direct" ? T.routeDirect : T.routeRelay });
    return {
      n,
      name: empty ? T.st.free : cleanName(p.name) || T.player(n),
      tags,
      me: n === me,
      empty,
      status: empty ? (session.mode === "host" ? T.freeHint : "") : T.st[p.status] ?? T.st.away,
      tone: p.tone ?? "",
      ping: empty || p.host || !Number.isFinite(p.ping) ? null : p.ping,
    };
  });
}

function mapBlock(slug, horde, sub) {
  if (!slug) return { kind: "map", glyph: "?", name: T.noMap, sub };
  const name = MAP_NAMES[slug] ?? slug;
  return { kind: "map", glyph: name[0], name, tag: horde ? T.hell : null, sub };
}

function settingsSection(session, inRoom) {
  const saved = savedLanguage();
  const blocks = [
    { kind: "input", label: T.yourName, field: "name", placeholder: T.namePlaceholder, act: "saveName", button: T.save, value: session.name, maxLength: 16 },
    { kind: "label", text: T.language },
    { kind: "chips", chips: [["", T.languageAuto], ...LANGUAGES].map(([code, label]) => ({ act: "lang", arg: code, label, on: saved === code })) },
  ];
  if (inRoom) {
    const items = [
      [T.relay, T.relayState[session.socket] ?? T.relayState.idle, session.socket === "open" ? "" : "error"],
      ...routeItems(session),
      [T.ping, pingText(session)],
    ];
    if (session.stats?.lost) items.push([T.dropped, String(session.stats.lost)]);
    blocks.push({ kind: "kv", items });
  }
  blocks.push(...directBlocks(session, inRoom), ...controllerBlocks(session), ...relayBlocks(session), { kind: "credits", text: T.credits });
  return { kind: "section", title: T.settings, act: "settings", open: session.showSettings, blocks };
}

/** Direct links exist from 2.3.0; a player on an older version never answers an offer. */
const supportsDirect = (version) => !isNewer("2.3.0", version);

const whyText = (why) => {
  if (/\|stun/.test(why)) return T.whyStun;
  if (/\|silent/.test(why)) return T.whySilent;
  if (/\|nat/.test(why)) return T.whyNat;
  if (/no link in time/.test(why)) return T.whyTimeout;
  return /too much/.test(why) ? T.whyFlood : T.whyFailed;
};

/** How the packets to one player travel, in words: seat 0 is the host (a guest's view), the others are guests. */
function routeText(session, seat) {
  const status = session.direct.status(seat);
  if (status.state === "open") return T.routeOpen(status.rtt == null ? null : Math.round(status.rtt));
  const version = seat === 0 ? session.hostInfo?.v : session.guests.get(seat)?.state?.v;
  if (version && !supportsDirect(version)) return T.routeOldVersion(seat === 0 ? T.theHost : T.player(seat + 1));
  if (status.state === "connecting") return T.routeTrying;
  if (status.state === "refused") return T.routeRefused;
  if (status.state === "failed") return T.routeFailed(whyText(status.why));
  return T.routeRelay;
}

/** Rows of the Settings list: a guest has one route (to the host), the host one per guest. */
function routeItems(session) {
  const links = session.direct;
  if (!session.directEnabled) return [[T.route, T.routeOff]];
  if (!links?.supported) return [[T.route, T.routeUnsupported]];
  if (session.mode === "guest") return [[T.route, routeText(session, 0), links.isOpen(0) ? "ok" : ""]];
  const present = [...session.guests.values()].filter((g) => g.present).sort((a, b) => a.seat - b.seat);
  if (!present.length) return [[T.route, T.routeRelay]];
  return present.map((g) => [`${T.route} \xB7 ${T.player(g.seat + 1)}`, routeText(session, g.seat), links.isOpen(g.seat) ? "ok" : ""]);
}

/** The ping to show: over a direct link where there is one. A host shows its slowest player. */
function pingValue(session) {
  const links = session.direct;
  if (session.mode === "guest") return links?.rtt(0) ?? session.stats?.rtt ?? null;
  const values = [...session.guests.values()].filter((g) => g.present).map((g) => links?.rtt(g.seat) ?? session.stats?.rtts?.[g.seat]).filter(Number.isFinite);
  return values.length ? Math.max(...values) : session.stats?.rtt ?? null;
}

const pingText = (session) => {
  const ping = pingValue(session);
  return ping != null ? `${Math.round(ping)} ms` : "–";
};

/** A mark for the in-game indicator while players are linked directly: a guest has one link, the host counts them. */
function directMark(session) {
  const links = session.direct;
  if (!links || !session.directEnabled) return "";
  if (session.mode === "guest") return links.isOpen(0) ? "⚡ " : "";
  const present = [...session.guests.values()].filter((g) => g.present);
  const open = present.filter((g) => links.isOpen(g.seat)).length;
  return open ? `⚡${open}/${present.length} ` : "";
}

function directBlocks(session, inRoom) {
  if (!inRoom) return [];
  const copied = Date.now() - session.copiedReportAt < COPIED_MS;
  return [
    { kind: "label", text: T.directLabel },
    { kind: "chips", chips: [{ act: "direct", arg: "1", label: T.directAllowed, on: session.directEnabled }, { act: "direct", arg: "0", label: T.directOff, on: !session.directEnabled }] },
    { kind: "text", cls: "muted small", text: T.directNote },
    { kind: "text", cls: "muted small", text: T.reportNote },
    { kind: "buttons", buttons: [{ act: "copyReport", label: copied ? T.copied : T.copyReport, style: copied ? "done" : "ghost" }] },
  ];
}

function controllerBlocks(session) {
  const pad = session.gamepad;
  const name = pad?.name ? pad.name.replace(/\s*\(.*$/, "").slice(0, 32) : "";
  let status;
  if (!session.controller) status = T.ctrl.off;
  else if (!session.patched && session.hash) status = T.ctrl.unavailable;
  else if (!pad || pad.status === "none") status = T.ctrl.press;
  else if (pad.status === "active") status = T.ctrl.active(name, session.aimLevel + 1, AIM_SPEEDS.length);
  else status = T.ctrl.later(name);
  const buttons =
    session.controller && pad?.status !== "none"
      ? [{ act: "aimDown", label: T.aimDown }, { act: "aimUp", label: T.aimUp }, { act: "controller", label: T.turnOff, style: "ghost" }]
      : [{ act: "controller", label: session.controller ? T.turnOff : T.turnOn, style: "ghost" }];
  return [{ kind: "kv", items: [[T.controller, status]] }, { kind: "buttons", buttons }];
}

function relayBlocks(session) {
  const custom = session.relay !== DEFAULT_RELAY;
  const blocks = [{ kind: "kv", items: [[T.relay, custom ? T.relayCustom(new URL(session.relay).hostname) : T.relayDefault]] }];
  if (!custom) blocks.push({ kind: "text", cls: "muted small", text: T.relayNote });
  if (session.usage) {
    const resets = new Date(session.usage.resetsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const label = session.usage.fraction >= 1 ? T.usedUp(resets) : T.usage(Math.round(session.usage.fraction * 100), resets);
    blocks.push({ kind: "meter", fraction: session.usage.fraction, label });
  }
  if (session.editRelay) {
    blocks.push({ kind: "input", field: "relay", placeholder: T.relayPlaceholder, act: "saveRelay", button: T.save, value: custom ? session.relay : "" });
    blocks.push({ kind: "text", cls: "muted small", text: T.relayEditNote });
    blocks.push({ kind: "buttons", buttons: [{ act: "defaultRelay", label: T.useDefault }, { act: "editRelay", label: T.cancel, style: "ghost" }] });
  } else {
    const buttons = [{ act: "editRelay", label: T.changeRelay, style: "ghost" }];
    if (!custom) buttons.unshift({ act: "openRelayGuide", label: T.relayGuide });
    blocks.push({ kind: "buttons", buttons });
  }
  return blocks;
}

/** On the shared default relay, and not already told it ran out. */
const onSharedRelay = (session) => session.relay === DEFAULT_RELAY && !session.overQuota;
const relayButtons = () => [{ act: "openRelayGuide", label: T.relayGuide }, { act: "editRelayNow", label: T.relayHaveOne, style: "ghost" }];
