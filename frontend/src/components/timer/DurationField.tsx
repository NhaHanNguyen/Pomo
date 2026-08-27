import { parts } from '../../format';
import { ChevronDownIcon, ChevronUpIcon } from '../icons';

interface Props {
  label: string;
  seconds: number;
  onChange: (seconds: number) => void;
  /** `hm` shows hours + minutes; `m` shows a single minutes field. */
  unit?: 'hm' | 'm';
  /** Steppers are only drawn in Manual mode, matching the design. */
  steppers?: boolean;
  step?: number;
  max?: number;
  disabled?: boolean;
}

export default function DurationField({
  label,
  seconds,
  onChange,
  unit = 'hm',
  steppers = false,
  step = 60,
  max = 12 * 3600,
  disabled,
}: Props) {
  const p = parts(seconds);
  const clamp = (v: number) => Math.min(max, Math.max(0, v));

  const setHours = (h: number) =>
    onChange(clamp(h * 3600 + Number(p.minutes) * 60));
  const setMinutes = (m: number) =>
    onChange(clamp(Number(p.hours) * 3600 + m * 60));

  const box =
    'tnum w-14 rounded-xl bg-surface px-2 py-1.5 text-center text-lg font-semibold text-ink ring-1 ring-hairline transition-colors focus:ring-2 focus:ring-sage-deep focus:outline-none disabled:opacity-50';

  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm font-semibold text-ink-soft">{label}</span>
      <div className="flex items-center gap-1.5">
        {unit === 'hm' ? (
          <>
            <input
              type="number"
              min={0}
              max={12}
              value={p.hours}
              disabled={disabled}
              onChange={(e) => setHours(Number(e.target.value))}
              aria-label={`${label} hours`}
              className={box}
            />
            <span className="text-lg font-bold text-ink-faint">:</span>
            <input
              type="number"
              min={0}
              max={59}
              value={p.minutes}
              disabled={disabled}
              onChange={(e) => setMinutes(Number(e.target.value))}
              aria-label={`${label} minutes`}
              className={box}
            />
          </>
        ) : (
          <>
            <input
              type="number"
              min={0}
              max={Math.floor(max / 60)}
              value={Math.floor(seconds / 60)}
              disabled={disabled}
              onChange={(e) => onChange(clamp(Number(e.target.value) * 60))}
              aria-label={`${label} minutes`}
              className={box}
            />
            <span className="text-sm text-ink-faint">min</span>
          </>
        )}

        {steppers && (
          <div className="ml-1 flex flex-col">
            <button
              onClick={() => onChange(clamp(seconds + step))}
              disabled={disabled}
              aria-label={`Increase ${label}`}
              className="grid h-4 w-6 place-items-center rounded-t text-ink-faint transition-colors hover:bg-surface-sunk hover:text-ink disabled:opacity-40"
            >
              <ChevronUpIcon className="size-4" />
            </button>
            <button
              onClick={() => onChange(clamp(seconds - step))}
              disabled={disabled}
              aria-label={`Decrease ${label}`}
              className="grid h-4 w-6 place-items-center rounded-b text-ink-faint transition-colors hover:bg-surface-sunk hover:text-ink disabled:opacity-40"
            >
              <ChevronDownIcon className="size-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
