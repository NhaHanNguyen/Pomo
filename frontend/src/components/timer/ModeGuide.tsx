import { useGame } from '../../state/game';
import {
  COIN_TIERS,
  KEYS_PER_CYCLE,
  PAUSE_COST,
  type TimerMode,
} from '../../types';
import { CoinIcon, KeyIcon } from '../icons';

interface Props {
  mode: TimerMode;
}

/**
 * Always-visible instructions for the mode you're in. The panel sits on the same
 * side as its label in the Auto/Manual switch — Auto on the left, Manual on the
 * right — so the toggle physically points at the guide that's showing.
 */
export default function ModeGuide({ mode }: Props) {
  const { state } = useGame();
  const auto = mode === 'auto';
  const minutes = state.elapsed / 60;
  const live = state.phase === 'focus';

  return (
    <aside
      key={mode}
      aria-label={`How ${auto ? 'Auto' : 'Manual'} mode works`}
      className={`animate-pop-in absolute top-1/2 z-10 w-[268px] -translate-y-1/2 rounded-card bg-surface/75 p-5 ring-1 ring-hairline backdrop-blur-sm ${
        auto ? 'left-8' : 'right-8'
      }`}
    >
      <p className="font-display text-lg font-bold tracking-wide text-ink uppercase">
        {auto ? 'Auto mode' : 'Manual mode'}
      </p>
      <p className="mt-0.5 text-xs font-semibold text-sage-deep">
        {auto ? 'Counts up · no end' : 'Counts down · set length'}
      </p>

      <ol className="mt-4 space-y-2.5">
        {(auto ? AUTO_STEPS : MANUAL_STEPS).map((step, i) => (
          <li key={i} className="flex gap-2.5">
            <span className="tnum mt-0.5 grid size-4.5 shrink-0 place-items-center rounded-full bg-sage-deep text-[10px] font-bold text-white">
              {i + 1}
            </span>
            <span className="text-xs leading-relaxed text-ink-soft">{step}</span>
          </li>
        ))}
      </ol>

      {/*
        Coin rate ladder as a two-column table rather than a run-on sentence.
        The row you're currently earning at lights up, so the panel doubles as a
        live readout of how much the next second is worth.
      */}
      <div className="mt-4 border-t border-hairline pt-3">
        <p className="flex items-center gap-1.5 text-xs font-bold text-ink">
          <CoinIcon className="size-3.5 shrink-0" />
          Coin rate
        </p>
        <ul className="mt-1.5">
          {COIN_TIERS.map((tier, i) => {
            const next = COIN_TIERS[i + 1];
            const active =
              live &&
              minutes >= tier.fromMinute &&
              (!next || minutes < next.fromMinute);
            return (
              <li
                key={tier.fromMinute}
                className={`flex items-center justify-between rounded-lg px-2 py-1 text-xs transition-colors ${
                  active ? 'bg-sage-deep font-bold text-white' : 'text-ink-soft'
                }`}
              >
                <span>
                  {next
                    ? `${tier.fromMinute}–${next.fromMinute} min`
                    : `${tier.fromMinute}+ min`}
                </span>
                <span className="tnum font-semibold">{tier.perSecond}/sec</span>
              </li>
            );
          })}
        </ul>
        <p className="mt-2 flex items-center gap-1.5 px-2 text-xs text-ink-soft">
          <KeyIcon className="size-3.5 shrink-0 text-ink" />
          {KEYS_PER_CYCLE} key per completed cycle
        </p>
      </div>

      <p className="mt-3 rounded-xl bg-danger/8 px-3 py-2 text-xs leading-relaxed font-semibold text-danger">
        Pausing costs {PAUSE_COST} coins in both modes. Settle in first.
      </p>
    </aside>
  );
}

const AUTO_STEPS = [
  'Press play. There is no countdown — the clock climbs.',
  'Focus until your attention genuinely runs out. The longer you hold, the faster coins come.',
  'Press Finish cycle when you are done — that claims your key.',
  'Your first Auto run becomes your baseline. Later runs chase it.',
];

const MANUAL_STEPS = [
  'Set your focus time with the arrows on the right.',
  'Press play. Coins land every second, faster the deeper you get.',
  'At zero it ends itself and starts your break.',
  'Spend what you earned over in the City tab.',
];
