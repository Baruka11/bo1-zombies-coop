// Page side of the packet pump: starts the worker (its bundled source is inlined at build time) and relays its
// messages into the session. It also owns the direct links (WebRTC does not exist in workers): the worker hands it
// the frames to send and it hands the worker the frames that arrive.
import { DirectLinks } from "./direct.js";
import { hostTokenFor } from "../util/settings.js";

export function startPump(session, onControl) {
  const url = URL.createObjectURL(new Blob([__PUMP_WORKER_SOURCE__], { type: "text/javascript" }));
  const worker = new Worker(url, { name: "bo1-coop-pump" });
  worker.onmessage = ({ data: message }) => {
    if (message.type === "direct-out") session.direct?.sendGame(message.seat, message.data);
    else if (message.type === "socket") session.onSocket(message);
    else if (message.type === "control") onControl(session, message.message);
    else if (message.type === "stats") session.stats = message.stats;
  };
  worker.onerror = (event) => session.fail("workerFailed", event.message);
  const direct = new DirectLinks({
    role: session.mode,
    enabled: session.directEnabled,
    signal: (message) => worker.postMessage({ type: "send", message }),
    onGame: (seat, data) => worker.postMessage({ type: "direct-in", seat, data }, [data]),
    onControl: (seat, message) => onControl(session, message),
    onChange: () => {
      worker.postMessage({ type: "direct", seats: direct.openSeats() });
      session.note(`direct links open: ${direct.openSeats().join(", ") || "none"}`);
    },
    seatsPresent: () => [...session.guests.values()].filter((g) => g.present).map((g) => g.seat),
    hostPresent: () => session.peer,
    log: (text) => session.note(text),
  });
  session.direct = direct;
  worker.postMessage({
    type: "connect",
    relay: session.relay,
    room: session.room,
    role: session.mode,
    guestId: session.guestId,
    hostToken: session.mode === "host" ? hostTokenFor(session.room) : undefined,
  });
  return worker;
}

/** Sends a control message to the other player(s): over their direct link where there is one, else through the relay. */
export function send(session, message) {
  if (!sendDirect(session, message)) sendRelay(session, message);
}

export function sendRelay(session, message) {
  session.pump?.postMessage({ type: "send", message });
}

/** True when direct links took care of the whole message. */
function sendDirect(session, message) {
  const links = session.direct;
  if (!links) return false;
  if (session.mode === "guest") return links.sendControl(0, message);
  const open = links.openSeats();
  if (!open.length) return false;
  if (message.to !== undefined) return links.sendControl(message.to, message);
  // A broadcast: each open link gets it directly, and the guests without one get it from the relay, one by one (the
  // relay's broadcast would reach the others twice).
  for (const seat of open) links.sendControl(seat, message);
  for (const g of session.guests.values()) if (g.present && !open.includes(g.seat)) sendRelay(session, { ...message, to: g.seat });
  return true;
}
