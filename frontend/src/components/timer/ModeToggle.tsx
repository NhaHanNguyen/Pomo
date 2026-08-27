import type { TimerMode } from '../../types';

interface Props {
  mode: TimerMode;
  onChange: (mode: TimerMode) => void;
  disabled?: boolean;
}

/** The Auto / Manual switch. Locked mid-run so a session can't change rules on you. */
export default function ModeToggle({ mode, onChange, disabled }: Props) {
  return (
    <div
      className={`flex items-center gap-3 ${disabled ? 'opacity-50' : ''}`}
      title={disabled ? 'Finish or reset the cycle to switch modes' : undefined}
    >
      <span
        className={`text-sm font-semibold transition-colors ${
          mode === 'auto' ? 'text-ink' : 'text-ink-faint'
        }`}
      >
        Auto
      </span>
      <button
        role="switch"
        aria-checked={mode === 'manual'}
        aria-label="Manual mode"
        disabled={disabled}
        onClick={() => onChange(mode === 'auto' ? 'manual' : 'auto')}
        className="relative h-7 w-14 rounded-pill bg-surface-sunk ring-1 ring-hairline transition-colors focus-visible:ring-2 focus-visible:ring-sage-deep focus-visible:outline-none disabled:cursor-not-allowed"
      >
        {/*
          `left-0` is load-bearing: without it the knob is positioned from the
          button's static position, which a button's default `text-align: center`
          puts at the centre, so the transform pushes it outside the track.
        */}
        <span
          className={`absolute top-1 left-0 size-5 rounded-full bg-sage-deep shadow-soft transition-transform duration-200 ${
            mode === 'manual' ? 'translate-x-8' : 'translate-x-1'
          }`}
        />
      </button>
      <span
        className={`text-sm font-semibold transition-colors ${
          mode === 'manual' ? 'text-ink' : 'text-ink-faint'
        }`}
      >
        Manual
      </span>
    </div>
  );
}
