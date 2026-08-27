/** Which screen the bottom tab bar is showing. */
export type Tab = 'timer' | 'city';

/**
 * Two ways to run a session, matching the Auto/Manual switch in the design.
 *
 * `auto`   — an open-ended stopwatch that counts *up*. You're trying to beat
 *            today's baseline and your all-time high score. This is why the
 *            clock reads "Hours / Minutes" and why pausing costs coins.
 * `manual` — a classic fixed-length Pomodoro that counts *down* from the
 *            focus time you dial in.
 */
export type TimerMode = 'auto' | 'manual';

export type TimerPhase = 'idle' | 'focus' | 'break' | 'paused';

export interface HouseKind {
  id: string;
  name: string;
  cost: number;
  keyCost: number;
  /** Coins this house adds to every completed cycle payout. */
  yield: number;
  /** Footprint in isometric grid tiles. */
  size: 1 | 2 | 3;
  category: HouseCategory;
  palette: { wall: string; roof: string; trim: string };
}

export type HouseCategory = 'homes' | 'shops' | 'parks' | 'civic';

export interface PlacedHouse {
  /** Instance id, distinct from the `HouseKind.id` it was built from. */
  id: string;
  kindId: string;
  name: string;
  /** Isometric grid coordinates. */
  gx: number;
  gy: number;
  builtAt: number;
  /** Minutes of focus banked at the moment this was built. */
  builtAfterMinutes: number;
}

export interface Settings {
  autoStartPomo: boolean;
  autoStartBreaks: boolean;
  longBreakInterval: number;
  blockedWebsites: string[];
  recommendBreakActivities: boolean;
  smallWindowAnimation: 'city' | 'sprout' | 'rain';
  alarmSound: string;
  alarmVolume: number;
  musicVolume: number;
  sfxVolume: number;
}

export interface GameState {
  coins: number;
  keys: number;
  cycle: number;
  /** Best single focus run ever, in seconds. */
  highScore: number;
  /** Today's target to beat, in seconds. */
  baseline: number;
  /** Manual-mode focus target, in seconds. */
  focusTarget: number;
  /** Cap on a single break, in seconds. */
  breakLimit: number;
  mode: TimerMode;
  phase: TimerPhase;
  /** Seconds elapsed in the current focus run. */
  elapsed: number;
  /** Seconds remaining in the current break. */
  breakRemaining: number;
  /** Total minutes focused all-time, used for house build history. */
  totalMinutes: number;
  /** Coins earned by focusing in the current cycle, for the end-of-cycle recap. */
  cycleCoins: number;
  /** Set when a cycle finishes; drives the celebration overlay until dismissed. */
  lastCycle: CycleSummary | null;
  houses: PlacedHouse[];
  settings: Settings;
}

/** Coins charged to pause, per the design's warning modal. */
export const PAUSE_COST = 50;

/** Keys earned for each completed cycle. */
export const KEYS_PER_CYCLE = 1;

/**
 * A cycle must run at least this long for the city to pay its yield.
 *
 * Without this, buildings pay per *cycle* regardless of length, so spamming
 * ten-second cycles would farm a big city's yield far faster than genuinely
 * focusing — exactly backwards. Five minutes matches the first coin tier.
 */
export const CITY_PAYOUT_MIN_SECONDS = 5 * 60;

/**
 * Coins per second, escalating the deeper into a cycle you get. Staying focused
 * is worth progressively more, so the last ten minutes of a long run pay far
 * better than the first ten — quitting early costs you the good rate.
 *
 * This is the single place to tune earning. Read `fromMinute` as "once you pass
 * this many minutes in the current cycle".
 */
export const COIN_TIERS: { fromMinute: number; perSecond: number }[] = [
  { fromMinute: 0, perSecond: 1 },
  { fromMinute: 5, perSecond: 2 },
  { fromMinute: 15, perSecond: 3 },
  { fromMinute: 30, perSecond: 4 },
  { fromMinute: 60, perSecond: 5 },
];

/** Coins awarded for the second at `elapsedSeconds` into a cycle. */
export function coinRate(elapsedSeconds: number): number {
  const minutes = elapsedSeconds / 60;
  let rate = COIN_TIERS[0].perSecond;
  for (const tier of COIN_TIERS) {
    if (minutes >= tier.fromMinute) rate = tier.perSecond;
  }
  return rate;
}

/** What a finished cycle paid out, for the celebration overlay. */
export interface CycleSummary {
  cycle: number;
  seconds: number;
  /** Coins from focusing, already credited second by second. */
  focusCoins: number;
  /** Coins the city paid at the end of the cycle. */
  cityCoins: number;
  keys: number;
  newHighScore: boolean;
  /** This run established the Auto baseline. */
  baselineSet: boolean;
}
