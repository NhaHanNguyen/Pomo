import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react';
import { kindById } from '../catalog';
import {
  CITY_PAYOUT_MIN_SECONDS,
  KEYS_PER_CYCLE,
  PAUSE_COST,
  coinRate,
  type CycleSummary,
  type GameState,
  type PlacedHouse,
  type Settings,
  type TimerMode,
} from '../types';

const STORAGE_KEY = 'pomo:state:v1';

const initialState: GameState = {
  /*
    Enough for exactly one Small House (3,000 + 1 key), so a new player can place
    their first building and see what the city is *for* before grinding for it.
    Everything beyond that has to be earned.
  */
  coins: 3000,
  keys: 1,
  cycle: 1,
  // Both start unset: a new account hasn't focused yet, so there's no best time
  // and no measured baseline. 0 means "not yet established".
  highScore: 0,
  baseline: 0,
  focusTarget: 25 * 60,
  breakLimit: 5 * 60,
  // Manual is the familiar Pomodoro — a set length that ends itself — so it's
  // the gentler landing spot for a first-time user. Auto is one toggle away,
  // and whichever you pick is remembered.
  mode: 'manual',
  phase: 'idle',
  elapsed: 0,
  breakRemaining: 0,
  totalMinutes: 0,
  cycleCoins: 0,
  lastCycle: null,
  houses: [],
  settings: {
    autoStartPomo: false,
    autoStartBreaks: true,
    longBreakInterval: 4,
    blockedWebsites: ['news.ycombinator.com', 'reddit.com'],
    recommendBreakActivities: true,
    smallWindowAnimation: 'city',
    alarmSound: 'Chime',
    alarmVolume: 0.7,
    musicVolume: 0.4,
    sfxVolume: 0.6,
  },
};

export type Action =
  | { type: 'tick' }
  | { type: 'start' }
  | { type: 'pause'; charge: boolean }
  | { type: 'resume' }
  | { type: 'finishCycle' }
  | { type: 'dismissSummary' }
  | { type: 'redoCycle' }
  | { type: 'skipBreak' }
  | { type: 'resetAll' }
  | { type: 'setMode'; mode: TimerMode }
  | { type: 'setBaseline'; seconds: number }
  | { type: 'setFocusTarget'; seconds: number }
  | { type: 'setBreakLimit'; seconds: number }
  | { type: 'buy'; kindId: string; gx: number; gy: number }
  | { type: 'renameHouse'; id: string; name: string }
  | { type: 'sellHouse'; id: string }
  | { type: 'patchSettings'; patch: Partial<Settings> };

/** Coins the buildings themselves pay out, once per completed cycle. */
function cityYield(state: GameState): number {
  return state.houses.reduce((sum, h) => sum + kindById(h.kindId).yield, 0);
}

/** Coins credited so far in the current run — already in the balance. */
function earnedThisCycle(state: GameState): number {
  return state.cycleCoins;
}

function completeCycle(state: GameState): GameState {
  const minutes = Math.floor(state.elapsed / 60);
  // Short cycles don't collect the city's yield — see CITY_PAYOUT_MIN_SECONDS.
  const cityCoins =
    state.elapsed >= CITY_PAYOUT_MIN_SECONDS ? cityYield(state) : 0;
  const baselineSet = state.mode === 'auto' && state.baseline === 0;

  const summary: CycleSummary = {
    cycle: state.cycle,
    seconds: state.elapsed,
    focusCoins: state.cycleCoins,
    cityCoins,
    keys: KEYS_PER_CYCLE,
    newHighScore: state.elapsed > state.highScore,
    baselineSet,
  };

  return {
    ...state,
    /*
      Focus coins were already credited second by second, so all that lands here
      is the city's per-cycle yield.
    */
    coins: state.coins + cityCoins,
    keys: state.keys + KEYS_PER_CYCLE,
    cycleCoins: 0,
    lastCycle: summary,
    cycle: state.cycle + 1,
    highScore: Math.max(state.highScore, state.elapsed),
    /*
      The baseline is measured, never typed: the first Auto run you finish
      becomes your target, and later Auto runs are scored against it. Manual runs
      don't touch it — they use the focus time you set.
    */
    baseline: baselineSet ? state.elapsed : state.baseline,
    totalMinutes: state.totalMinutes + minutes,
    elapsed: 0,
    // Every `longBreakInterval` cycles the break is doubled.
    breakRemaining: state.settings.autoStartBreaks
      ? state.breakLimit *
        (state.cycle % state.settings.longBreakInterval === 0 ? 2 : 1)
      : 0,
    phase: state.settings.autoStartBreaks ? 'break' : 'idle',
  };
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'tick': {
      if (state.phase === 'focus') {
        const elapsed = state.elapsed + 1;
        /*
          Coins land every second at the rate for how deep into the cycle you
          are, so the reward curve steepens the longer you hold on.
        */
        const award = coinRate(state.elapsed);
        const coins = state.coins + award;
        const cycleCoins = state.cycleCoins + award;
        // Manual mode is a countdown, so reaching the target ends the cycle.
        if (state.mode === 'manual' && elapsed >= state.focusTarget) {
          return completeCycle({
            ...state,
            coins,
            cycleCoins,
            elapsed: state.focusTarget,
          });
        }
        return { ...state, elapsed, coins, cycleCoins };
      }
      if (state.phase === 'break') {
        const breakRemaining = state.breakRemaining - 1;
        if (breakRemaining <= 0) {
          return {
            ...state,
            breakRemaining: 0,
            phase: state.settings.autoStartPomo ? 'focus' : 'idle',
          };
        }
        return { ...state, breakRemaining };
      }
      return state;
    }

    case 'start':
      return { ...state, phase: 'focus' };

    case 'pause':
      // Pausing costs coins in both modes — stopping should always sting.
      if (action.charge && state.coins < PAUSE_COST) return state;
      return {
        ...state,
        phase: 'paused',
        coins: action.charge ? state.coins - PAUSE_COST : state.coins,
      };

    case 'resume':
      return { ...state, phase: 'focus' };

    case 'finishCycle':
      return state.elapsed > 0 ? completeCycle(state) : state;

    case 'dismissSummary':
      return { ...state, lastCycle: null };

    case 'redoCycle':
      /*
        Abandon the run: you keep the coins already credited, but forfeit this
        cycle's key, city yield and high-score credit.
      */
      return { ...state, elapsed: 0, cycleCoins: 0, phase: 'idle' };

    case 'skipBreak':
      return { ...state, breakRemaining: 0, phase: 'idle' };

    case 'resetAll':
      return { ...initialState, settings: state.settings };

    case 'setMode':
      return {
        ...state,
        mode: action.mode,
        phase: 'idle',
        elapsed: 0,
        cycleCoins: 0,
      };

    case 'setBaseline':
      return { ...state, baseline: action.seconds };

    case 'setFocusTarget':
      return { ...state, focusTarget: action.seconds };

    case 'setBreakLimit':
      return { ...state, breakLimit: action.seconds };

    case 'buy': {
      const kind = kindById(action.kindId);
      if (state.coins < kind.cost || state.keys < kind.keyCost) return state;
      if (state.houses.some((h) => h.gx === action.gx && h.gy === action.gy)) {
        return state;
      }
      const house: PlacedHouse = {
        id: `${action.kindId}-${Date.now()}`,
        kindId: action.kindId,
        name: kind.name,
        gx: action.gx,
        gy: action.gy,
        builtAt: Date.now(),
        builtAfterMinutes: state.totalMinutes,
      };
      return {
        ...state,
        coins: state.coins - kind.cost,
        keys: state.keys - kind.keyCost,
        houses: [...state.houses, house],
      };
    }

    case 'renameHouse':
      return {
        ...state,
        houses: state.houses.map((h) =>
          h.id === action.id ? { ...h, name: action.name } : h,
        ),
      };

    case 'sellHouse': {
      const house = state.houses.find((h) => h.id === action.id);
      if (!house) return state;
      const kind = kindById(house.kindId);
      return {
        ...state,
        // Refund half the coins; keys are returned in full.
        coins: state.coins + Math.floor(kind.cost / 2),
        keys: state.keys + kind.keyCost,
        houses: state.houses.filter((h) => h.id !== action.id),
      };
    }

    case 'patchSettings':
      return { ...state, settings: { ...state.settings, ...action.patch } };

    default:
      return state;
  }
}

function load(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const saved = JSON.parse(raw) as Partial<GameState>;
    return {
      ...initialState,
      ...saved,
      settings: { ...initialState.settings, ...(saved.settings ?? {}) },
      // Never restore mid-run: a reload shouldn't silently keep counting, and
      // it certainly shouldn't replay a celebration you already saw.
      phase: 'idle',
      elapsed: 0,
      breakRemaining: 0,
      cycleCoins: 0,
      lastCycle: null,
    };
  } catch {
    return initialState;
  }
}

const GameContext = createContext<{
  state: GameState;
  dispatch: Dispatch<Action>;
} | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);

  // Drive the clock. One interval for the whole app, only while something runs.
  useEffect(() => {
    if (state.phase !== 'focus' && state.phase !== 'break') return;
    const id = setInterval(() => dispatch({ type: 'tick' }), 1000);
    return () => clearInterval(id);
  }, [state.phase]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside <GameProvider>');
  return ctx;
}

export { cityYield, earnedThisCycle };
