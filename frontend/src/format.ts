const pad = (n: number) => String(Math.max(0, Math.floor(n))).padStart(2, '0');

/** Split seconds into the hours / minutes / seconds the clock displays. */
export function parts(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  return {
    hours: pad(Math.floor(s / 3600)),
    minutes: pad(Math.floor((s % 3600) / 60)),
    seconds: pad(s % 60),
  };
}

/** "02:32" — the compact form used for high score and baseline chips. */
export function hm(totalSeconds: number) {
  const p = parts(totalSeconds);
  return `${p.hours}:${p.minutes}`;
}

/** "2h 32m", for prose. */
export function human(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export const commas = (n: number) => n.toLocaleString('en-US');
