// What the card's "Copy diagnostic report" button puts on the clipboard, and the few measurements behind it. For bug
// reports: versions, routes, counters and recent events. It leaves out everything personal: no IP address, no name, no
// room code (that one is the key to the room), and the relay only as "default" or "custom".
import { MAP_NAMES, currentSlug, screen } from "../game/page.js";

const HITCH_MS = 300; // two presented frames this far apart while the game runs: a stall
const JUMP_BASE_UNITS = 150; // a move beyond this plus what MAX_UNITS_PER_S allows for the time between two positions...
const MAX_UNITS_PER_S = 450; // ...(a player runs about 200 units a second; falling and sprinting are faster): a jump
const FPS_WINDOW_MS = 10000;
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
  if (/resumed/.test(detail)) session.resumedAt = Date.now();
  session.note(detail);
  remember(session.pauses, `${new Date().toISOString().slice(11, 23)} ${detail}`);
}

/** What was going on when a stall or a jump was seen: the likely causes are told apart from plain play. */
function context(session) {
  const now = Date.now();
  if (document.hidden) return "the game tab was in the background";
  if (now - (session.resumedAt ?? 0) < 4000) return "just after a pause";
  if (now - (session.rosterChangedAt ?? 0) < 15000) return "a player was joining or leaving";
  return "steady play";
}

const clock = (at) => new Date(at).toISOString().slice(11, 19);

/** "12 steady play, 3 just after a pause": how many of the kept entries each situation accounts for. */
function byContext(entries) {
  const counts = new Map();
  for (const entry of entries) counts.set(entry.why, (counts.get(entry.why) ?? 0) + 1);
  return [...counts].map(([why, n]) => `${n} ${why}`).join(", ");
}

/**
 * Two measurements while the game runs, both independent of how often this page gets to run:
 *  - stalls: the intervals between the frames the engine presented, read from its own ring through the page. One over
 *    HITCH_MS is a stall. (A throttled tab or a slow tick cannot fake one: the ring keeps every frame.)
 *  - jumps: the camera positions the engine logs, about one a second, with the engine's own clock between them. A
 *    player runs about 200 units a second, so two positions a second apart are normally 200 units apart; a jump is a
 *    move far beyond what the time between them allows (a teleporter, a teleported guest).
 */
export function sampleView(session) {
  const sample = (session.sample ??= { reader: null, lastView: null, lastViewMs: -1, fpsWindow: [] });
  sampleFrames(session, sample);
  sampleJumps(session, sample);
}

function sampleFrames(session, sample) {
  sample.reader ??= window.five?.engine?.presentReader?.() ?? null;
  const frames = sample.reader?.();
  if (!frames?.intervals.length) return;
  const now = Date.now();
  if (!session.paused) {
    for (const interval of frames.intervals) {
      if (interval > HITCH_MS) remember(session.hitches, { at: now, ms: Math.round(interval), why: context(session) });
    }
  }
  const total = frames.intervals.reduce((sum, value) => sum + value, 0);
  sample.fpsWindow.push({ at: now, frames: frames.intervals.length, ms: total });
  while (sample.fpsWindow.length && now - sample.fpsWindow[0].at > FPS_WINDOW_MS) sample.fpsWindow.shift();
}

function sampleJumps(session, sample) {
  for (const view of window.five?.views ?? []) {
    if (view.ms <= sample.lastViewMs) continue;
    sample.lastViewMs = view.ms;
    const usable = Array.isArray(view.origin) && view.origin.length === 3 && view.origin.every(Number.isFinite) && !(view.flags & FIXED_CAMERA) && !view.paused;
    const previous = sample.lastView;
    sample.lastView = usable ? view : null;
    if (!usable || !previous) continue;
    const seconds = (view.engineMs - previous.engineMs) / 1000;
    if (!(seconds > 0) || seconds > 5) continue;
    const moved = distance(previous.origin, view.origin);
    const ours = Date.now() - (session.movedAt ?? 0) < 3000; // we teleported ourselves to the host
    if (moved > JUMP_BASE_UNITS + MAX_UNITS_PER_S * seconds && !ours) {
      remember(session.jumps, { at: Date.now(), units: Math.round(moved), ms: Math.round(seconds * 1000), why: context(session) });
    }
  }
}

/** Frames per second the game presented over the last few seconds, or null before there are enough. */
function recentFps(session) {
  const window10 = session.sample?.fpsWindow ?? [];
  const frames = window10.reduce((sum, w) => sum + w.frames, 0);
  const ms = window10.reduce((sum, w) => sum + w.ms, 0);
  return ms > 500 ? Math.round((1000 * frames) / ms) : null;
}


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
  lines.push(`packets: out ${stats.packetsOut ?? 0}, in ${stats.packetsIn ?? 0} | direct frames: out ${stats.directOut ?? 0}, in ${stats.directIn ?? 0}, refused ${(stats.directInvalid ?? 0) + (stats.directLimited ?? 0)} | lost ${stats.lost ?? 0}, dropped ${stats.dropped ?? 0} (inbound while the engine was not taking packets ${stats.droppedIn ?? 0}, outbound with the relay closed ${stats.droppedOut ?? 0})`);
  const present = [...session.guests.values()].filter((g) => g.present).map((g) => g.seat);
  if (session.mode === "host") lines.push(`guests in the room: ${present.join(", ") || "none"}`);

  lines.push("");
  lines.push(`pauses (last ${KEEP}):`);
  lines.push(...(session.pauses.length ? session.pauses.map((p) => `  ${p}`) : ["  none"]));

  const worst = Math.max(0, ...session.hitches.map((h) => h.ms));
  lines.push("");
  const fps = recentFps(session);
  lines.push(`game frame rate over the last ${FPS_WINDOW_MS / 1000} s: ${fps ?? "-"} fps`);
  lines.push(`stalls over ${HITCH_MS} ms between presented frames: ${session.hitches.length} kept, worst ${worst} ms${session.hitches.length ? ` (${byContext(session.hitches)})` : ""}`);
  lines.push(...session.hitches.slice(-8).map((h) => `  ${clock(h.at)} ${h.ms} ms, ${h.why}`));
  lines.push(`sudden jumps (a move far beyond ${MAX_UNITS_PER_S} units a second): ${session.jumps.length} kept${session.jumps.length ? ` (${byContext(session.jumps)})` : ""}`);
  lines.push(...session.jumps.slice(-8).map((j) => `  ${clock(j.at)} ${j.units} units in ${j.ms} ms, ${j.why}`));

  lines.push("");
  lines.push(`events (last ${LOG_LINES}):`);
  lines.push(...session.log.slice(-LOG_LINES).map((l) => `  ${l}`));
  if (session.error) lines.push("", `error shown: ${session.error}`);
  return lines.join("\n");
}
