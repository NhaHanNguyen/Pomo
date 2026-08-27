import { useEffect, useRef, useState } from 'react';
import { useGame } from '../../state/game';
import { coinRate } from '../../types';
import { CoinIcon } from '../icons';

interface Toast {
  id: number;
  amount: number;
}

const LIFETIME = 1500;

/**
 * Pops a coin every second you stay focused, drifting up toward the balance in
 * the HUD. The amount climbs as the cycle deepens, so the number itself shows
 * the reward curve working. Lives in the shell rather than the Timer screen so the
 * feedback keeps coming while you're browsing the city mid-session.
 *
 * This mirrors a credit that already happened: the reducer awards the same
 * amount on the same tick, so the toast and the HUD counter never disagree.
 */
export default function CoinToasts() {
  const { state } = useGame();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const lastSecond = useRef(0);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    if (state.phase !== 'focus') {
      // Re-baseline so a reset or a new run doesn't fire a burst of catch-ups.
      lastSecond.current = state.elapsed;
      return;
    }

    if (state.elapsed <= lastSecond.current) return;
    lastSecond.current = state.elapsed;

    /*
      The reducer credited `coinRate(elapsed - 1)` for the second that just
      passed, so mirror that exact figure — the popup should never disagree with
      the balance.
    */
    const amount = coinRate(state.elapsed - 1);
    const id = state.elapsed;
    // Cap the stack so a long run can't pile up unbounded nodes.
    setToasts((t) => [...t.slice(-3), { id, amount }]);
    const timer = window.setTimeout(
      () => setToasts((t) => t.filter((x) => x.id !== id)),
      LIFETIME,
    );
    timers.current.push(timer);
  }, [state.elapsed, state.phase]);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
    },
    [],
  );

  if (toasts.length === 0) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute top-24 right-10 z-20 flex flex-col items-end gap-1"
    >
      {toasts.map((t) => (
        <span
          key={t.id}
          className="animate-coin-float shadow-soft flex items-center gap-1.5 rounded-pill bg-surface/95 px-3 py-1.5 ring-1 ring-coin/40"
        >
          <CoinIcon className="size-4" />
          <span className="tnum text-sm font-bold text-ink">+{t.amount}</span>
        </span>
      ))}
    </div>
  );
}
