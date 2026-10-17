// What the card's "Copy diagnostic report" button puts on the clipboard, and the few measurements behind it. For bug
// reports: versions, routes, counters and recent events. It leaves out everything personal: no IP address, no name, no
// room code (that one is the key to the room), and the relay only as "default" or "custom".
import { MAP_NAMES, currentSlug, latestView, screen } from "../game/page.js";

const HITCH_MS = 300; // no new camera position for this long while the game runs: a stall
const JUMP_UNITS = 150; // a camera position this far from the last one (a player walks 3 units per 16 ms at most)
const FIXED_CAMERA = 0x400; // the intro and scoreboard cameras: they cut, by design
const KEEP = 20;
const LOG_LINES = 60;

const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const remember = (list, entry) => {
  list.push(entry);
  if (list.length > KEEP) list.shift();
};

/** A pause (or its end) with how long it took: `detail` is a short sentence. Also goes into the event log. */
export function notePause(session, detail) {
  session.note(detail);
  remember(session.pauses, `${new Date().toISOString().slice(11, 23)} ${detail}`);
}

/**
 * Watches the camera positions vsynced by the page (about every frame) and counts what players call lag and
 * teleporting: stalls and sudden jumps while the game is running (not paused, not in a cut scene).
 */
export function sampleView(session) {
  const view = latestView();
  const sample = (session.sample ??= { ms: null, at: 0, origin: null });
  if (session.paused || (view && view.flags & FIXED_CAMERA)) {
    sample.at = 0;
    sample.ms = view?.ms ?? sample.ms;
    return;
  }
  if (!view || view.ms === sample.ms) return;
  const now = performance.now();
  if (sample.at) {
    const gap = now - sample.at;
    if (gap > HITCH_MS) remember(session.hitches, { at: Date.now(), ms: Math.round(gap) });
    const moved = distance(sample.origin, view.origin);
    const ours = Date.now() - (session.movedAt ?? 0) < 3000; // we teleported ourselves to the host
    if (moved > JUMP_UNITS && !ours) remember(session.jumps, { at: Date.now(), units: Math.round(moved), ms: Math.round(gap) });
  }
  sample.ms = view.ms;
  sample.at = now;
  sample.origin = view.origin;
}

const ago = (at) => `${Math.round((Date.now() - at) / 1000)} s ago`;

export function buildReport(session, defaultRelay) {
  const lines = [];
  const stats = session.stats ?? {};
  const links = session.direct;
  const slug = session.hostInfo?.slug ?? currentSlug();
  lines.push(`BO1 Zombies Co-op ${session.version} diagnostic report`);
  lines.push(`role: ${session.mode ?? "solo"}${session.mode === "guest" ? ` (seat ${session.seat ?? "?"})` : ""} | map: ${MAP_NAMES[slug] ?? slug ?? "?"} | screen: ${screen() ?? "?"} | phase: ${session.phase}`);
  lines.push(`engine: ${session.hash ? session.hash.slice(0, 8) : "?"} (${session.build ? "known" : "UNKNOWN"}, ${session.patched ? "patched" : "not patched"}) | page: ${location.pathname.split("/")[1] || "/"}`);
  lines.push(`relay: ${session.relay === defaultRelay ? "default" : "custom"} (${session.socket}) | ping via relay: ${Number.isFinite(stats.rtt) ? `${Math.round(stats.rtt)} ms` : "-"}`);
  lines.push(`direct links: ${session.directEnabled ? "allowed" : "off"}${links?.supported ? "" : " (not supported here)"}`);
  const routes = Object.entries(links?.summary() ?? {}).map(([seat, link]) => `${seat === "0" ? "host" : `seat ${seat}`}: ${link.state}${Number.isFinite(link.rtt) ? ` ${Math.round(link.rtt)} ms` : ""}`);
  lines.push(`routes: ${routes.join(", ") || "all through the relay"}`);
  lines.push(`packets: out ${stats.packetsOut ?? 0}, in ${stats.packetsIn ?? 0} | direct frames: out ${stats.directOut ?? 0}, in ${stats.directIn ?? 0}, refused ${(stats.directInvalid ?? 0) + (stats.directLimited ?? 0)} | lost ${stats.lost ?? 0}, dropped ${stats.dropped ?? 0}`);
  const present = [...session.guests.values()].filter((g) => g.present).map((g) => g.seat);
  if (session.mode === "host") lines.push(`guests in the room: ${present.join(", ") || "none"}`);

  lines.push("");
  lines.push(`pauses (last ${KEEP}):`);
  lines.push(...(session.pauses.length ? session.pauses.map((p) => `  ${p}`) : ["  none"]));

  const worst = Math.max(0, ...session.hitches.map((h) => h.ms));
  lines.push("");
  lines.push(`stalls over ${HITCH_MS} ms while playing: ${session.hitches.length} kept, worst ${worst} ms${session.hitches.length ? `, last ${ago(session.hitches.at(-1).at)}` : ""}`);
  lines.push(`sudden jumps over ${JUMP_UNITS} units: ${session.jumps.length} kept${session.jumps.length ? `, last ${session.jumps.at(-1).units} units ${ago(session.jumps.at(-1).at)}` : ""}`);

  lines.push("");
  lines.push(`events (last ${LOG_LINES}):`);
  lines.push(...session.log.slice(-LOG_LINES).map((l) => `  ${l}`));
  if (session.error) lines.push("", `error shown: ${session.error}`);
  return lines.join("\n");
}
