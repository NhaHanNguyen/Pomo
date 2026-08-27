import { commas, human } from '../../format';
import { useGame } from '../../state/game';
import { CITY_PAYOUT_MIN_SECONDS } from '../../types';
import { CoinIcon, KeyIcon, SparkIcon } from '../icons';
import Button from '../ui/Button';

/**
 * Celebration shown the moment a cycle finishes, breaking the payout into what
 * your focus earned versus what your city earned — so the city's contribution is
 * visible and growing it feels worth doing.
 */
export default function CycleComplete() {
  const { state, dispatch } = useGame();
  const s = state.lastCycle;
  if (!s) return null;

  const total = s.focusCoins + s.cityCoins;
  const dismiss = () => dispatch({ type: 'dismissSummary' });

  /* Owned buildings that paid nothing because the cycle was too short. */
  const cityTooShort =
    state.houses.length > 0 && s.seconds < CITY_PAYOUT_MIN_SECONDS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div
        className="animate-fade-in absolute inset-0 bg-ink/30 backdrop-blur-sm"
        onClick={dismiss}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Cycle ${s.cycle} complete`}
        className="animate-pop-in shadow-pop relative w-[440px] overflow-hidden rounded-card bg-surface ring-1 ring-hairline"
      >
        {/* Header */}
        <div className="relative overflow-hidden bg-sage-deep px-8 pt-8 pb-7 text-center">
          <div
            aria-hidden
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 30%, white 2px, transparent 2px), radial-gradient(circle at 75% 20%, white 1.5px, transparent 1.5px), radial-gradient(circle at 55% 75%, white 2px, transparent 2px), radial-gradient(circle at 88% 65%, white 1.5px, transparent 1.5px)',
              backgroundSize: '100% 100%',
            }}
          />
          <p className="relative text-xs font-bold tracking-[0.25em] text-white/75 uppercase">
            Cycle {s.cycle} complete
          </p>
          <p className="font-display relative mt-1 text-5xl font-bold tracking-wide text-white">
            {human(s.seconds)}
          </p>
          <p className="relative mt-1 text-sm font-semibold text-white/80">
            focused
          </p>
        </div>

        {/* Payout breakdown */}
        <div className="px-8 py-6">
          <ul className="space-y-2.5">
            <Line
              label="From focusing"
              hint="Earned second by second, at a rate that climbs"
              value={s.focusCoins}
            />
            <Line
              label="From your city"
              hint={
                state.houses.length === 0
                  ? 'Build something and this starts paying'
                  : cityTooShort
                    ? `Needs a ${CITY_PAYOUT_MIN_SECONDS / 60}+ minute cycle to pay out`
                    : `${state.houses.length} building${
                        state.houses.length === 1 ? '' : 's'
                      } paying out`
              }
              value={s.cityCoins}
              muted={s.cityCoins === 0}
              warn={cityTooShort}
            />
          </ul>

          <div className="mt-4 flex items-center justify-between border-t-2 border-hairline pt-4">
            <span className="font-bold text-ink">Total this cycle</span>
            <span className="tnum flex items-center gap-2 text-2xl font-bold text-ink">
              <CoinIcon className="size-6" />
              {commas(total)}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between rounded-2xl bg-sand/25 px-4 py-3">
            <span className="font-semibold text-ink">Keys earned</span>
            <span className="tnum flex items-center gap-2 text-lg font-bold text-ink">
              <KeyIcon className="size-5" />+{s.keys}
            </span>
          </div>

          {/* Milestones */}
          {(s.newHighScore || s.baselineSet) && (
            <div className="mt-4 space-y-2">
              {s.baselineSet && (
                <Badge>
                  Baseline set to {human(s.seconds)} — that's your target from
                  here.
                </Badge>
              )}
              {s.newHighScore && <Badge>New personal best!</Badge>}
            </div>
          )}

          <Button
            variant="primary"
            size="lg"
            className="mt-6 w-full"
            onClick={dismiss}
            autoFocus
          >
            {state.phase === 'break' ? 'Start my break' : 'Nice'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Line({
  label,
  hint,
  value,
  muted = false,
  warn = false,
}: {
  label: string;
  hint: string;
  value: number;
  muted?: boolean;
  warn?: boolean;
}) {
  return (
    <li className="flex items-start justify-between gap-4">
      <span>
        <span className="block text-sm font-semibold text-ink">{label}</span>
        <span
          className={`block text-xs ${warn ? 'font-semibold text-danger' : 'text-ink-faint'}`}
        >
          {hint}
        </span>
      </span>
      <span
        className={`tnum flex shrink-0 items-center gap-1.5 font-bold ${
          muted ? 'text-ink-faint' : 'text-ink'
        }`}
      >
        <CoinIcon className="size-4" />+{commas(value)}
      </span>
    </li>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2 rounded-xl bg-terracotta/12 px-3 py-2 text-xs font-bold text-terracotta">
      <SparkIcon className="size-4 shrink-0" />
      {children}
    </p>
  );
}
