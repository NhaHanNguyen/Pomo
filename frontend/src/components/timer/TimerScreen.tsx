import { useState } from 'react';
import { commas, hm, human, parts } from '../../format';
import { earnedThisCycle, useGame } from '../../state/game';
import { PAUSE_COST } from '../../types';
import Skyline from '../city/Skyline';
import {
  CheckIcon,
  CoinIcon,
  PauseIcon,
  PlayIcon,
  RedoIcon,
  SparkIcon,
} from '../icons';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import DurationField from './DurationField';
import ModeGuide from './ModeGuide';
import ModeToggle from './ModeToggle';

/** Shown wherever a time hasn't been established yet. */
const UNSET = '--:--';

export default function TimerScreen() {
  const { state, dispatch } = useGame();
  const [askPause, setAskPause] = useState(false);

  const { mode, phase, elapsed, focusTarget, breakLimit, baseline, highScore } =
    state;
  const running = phase === 'focus';
  const onBreak = phase === 'break';
  const busy = phase !== 'idle';

  // Auto counts up; manual counts down toward the target.
  const shown = mode === 'auto' ? elapsed : Math.max(0, focusTarget - elapsed);
  const p = parts(onBreak ? state.breakRemaining : shown);

  /** Auto with no baseline yet: this run is the measurement. */
  const calibrating = mode === 'auto' && baseline === 0;

  const beatBaseline = mode === 'auto' && baseline > 0 && elapsed >= baseline;
  // Don't crow about a personal best until there's a previous one to beat.
  const beatHighScore = mode === 'auto' && highScore > 0 && elapsed > highScore;

  // Calibrating has no target, so there's nothing to fill a bar toward.
  const progress = calibrating
    ? null
    : mode === 'manual'
      ? Math.min(1, focusTarget > 0 ? elapsed / focusTarget : 0)
      : Math.min(1, elapsed / baseline);

  // Both modes charge to pause, so the confirmation is always the same.
  const handlePause = () => setAskPause(true);

  return (
    <div className="relative flex h-full flex-col items-center justify-center">
      <Skyline dimmed={running} />
      <ModeGuide mode={mode} />

      <div className="relative z-10 flex w-full max-w-[720px] flex-col items-center px-8">
        <h1 className="font-display text-6xl font-bold tracking-[0.08em] text-ink uppercase">
          Pomo
        </h1>

        {/* Clock */}
        <div className="mt-8 flex items-end gap-6">
          <div className="flex flex-col items-center pb-6">
            <span className="text-xs font-semibold tracking-widest text-ink-faint uppercase">
              Cycle
            </span>
            <span className="tnum text-4xl font-bold text-ink">
              {state.cycle}
            </span>
          </div>

          <div className="flex flex-col items-center">
            {onBreak && (
              <span className="mb-1 rounded-pill bg-sage/20 px-3 py-0.5 text-xs font-bold tracking-widest text-sage-deep uppercase">
                Break
              </span>
            )}
            <div className="flex items-start gap-3">
              <TimeUnit value={p.hours} label="Hours" />
              <span className="tnum pt-1 text-7xl leading-none font-bold text-ink-faint">
                :
              </span>
              <TimeUnit value={p.minutes} label="Minutes" />
              <span
                className="tnum self-start pt-4 text-2xl font-semibold text-ink-faint"
                aria-label="seconds"
              >
                {p.seconds}
              </span>
            </div>
          </div>

          <div className="pb-8">
            {onBreak ? (
              <Button variant="soft" size="lg" onClick={() => dispatch({ type: 'skipBreak' })}>
                Skip break
              </Button>
            ) : (
              <button
                onClick={() =>
                  running
                    ? handlePause()
                    : dispatch({ type: phase === 'paused' ? 'resume' : 'start' })
                }
                aria-label={running ? 'Pause' : 'Start'}
                className="grid size-16 place-items-center rounded-full bg-sage-deep text-white shadow-lift transition-all duration-200 hover:scale-105 hover:bg-sage active:scale-95"
              >
                {running ? (
                  <PauseIcon className="size-7" />
                ) : (
                  <PlayIcon className="ml-1 size-7" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Progress toward baseline (auto) or target (manual) */}
        {progress !== null && (
          <div className="mt-6 h-1.5 w-[380px] overflow-hidden rounded-pill bg-surface-sunk">
            <div
              className="h-full rounded-pill bg-sage-deep transition-[width] duration-1000 ease-linear"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        )}

        {/* Score chips */}
        <div className="mt-4 flex items-center gap-2">
          <Chip
            label="High score"
            value={highScore > 0 ? hm(highScore) : UNSET}
            highlight={beatHighScore}
          />
          {mode === 'auto' && !calibrating && (
            <Chip
              label="Baseline"
              value={hm(baseline)}
              highlight={beatBaseline}
            />
          )}
          {elapsed >= 60 && (
            <span
              className="flex items-center gap-1.5 rounded-pill bg-coin/15 px-3 py-1.5 text-sm font-semibold text-ink"
              title="Already added to your balance"
            >
              <CoinIcon className="size-4" />
              {commas(earnedThisCycle(state))} this cycle
            </span>
          )}
        </div>

        {beatHighScore && (
          <p className="animate-rise mt-3 flex items-center gap-1.5 text-sm font-bold text-terracotta">
            <SparkIcon className="size-4" /> New personal best!
          </p>
        )}

        {/*
          Abandoning a run is only offered once you've already paused — which
          costs coins. Exposing it during a run made it a free way to stop and
          skip the pause fee entirely.
        */}
        {phase === 'paused' && (
          <button
            onClick={() => dispatch({ type: 'redoCycle' })}
            className="mt-4 flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-xs font-semibold text-ink-faint underline underline-offset-2 transition-colors hover:text-danger"
          >
            <RedoIcon className="size-3.5" />
            Give up on this cycle and start over
          </button>
        )}

        {/* Controls */}
        <div className="mt-10 w-[380px] rounded-card bg-surface/80 p-6 ring-1 ring-hairline backdrop-blur-sm">
          <div className="flex justify-center">
            <ModeToggle
              mode={mode}
              onChange={(m) => dispatch({ type: 'setMode', mode: m })}
              disabled={busy}
            />
          </div>

          {/* Auto is the unfamiliar mode, so say what each one does up front. */}
          <p className="mt-3 text-center text-xs leading-relaxed text-ink-faint">
            {mode === 'auto'
              ? `Counts up with no end. Pausing costs ${PAUSE_COST} coins.`
              : `Counts down and ends itself. Pausing costs ${PAUSE_COST} coins.`}
          </p>

          <div className="mt-5 space-y-3">
            {mode === 'auto' ? (
              /*
                Auto's baseline is measured, not entered — so this reports it
                rather than asking for it.
              */
              <div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold text-ink-soft">
                    Your Baseline
                  </span>
                  <span className="flex items-center gap-2">
                    <span
                      className={`tnum text-lg font-semibold ${
                        calibrating ? 'text-ink-faint' : 'text-ink'
                      }`}
                    >
                      {calibrating ? UNSET : hm(baseline)}
                    </span>
                    {!calibrating && (
                      <button
                        onClick={() =>
                          dispatch({ type: 'setBaseline', seconds: 0 })
                        }
                        disabled={busy}
                        title="Clear it so your next Auto run measures a new one"
                        className="rounded-pill px-2 py-1 text-xs font-semibold text-ink-faint underline underline-offset-2 transition-colors hover:text-sage-deep disabled:opacity-40"
                      >
                        Recalibrate
                      </button>
                    )}
                  </span>
                </div>
                {calibrating && (
                  <p className="mt-1 text-xs leading-relaxed text-ink-faint">
                    Not set yet — this Auto run will measure it.
                  </p>
                )}
              </div>
            ) : (
              <DurationField
                label="Focus Time"
                seconds={focusTarget}
                onChange={(s) =>
                  dispatch({ type: 'setFocusTarget', seconds: s })
                }
                steppers
                step={5 * 60}
                disabled={busy}
              />
            )}
            <DurationField
              label="Break Limit"
              seconds={breakLimit}
              onChange={(s) => dispatch({ type: 'setBreakLimit', seconds: s })}
              unit="m"
              steppers={mode === 'manual'}
              step={60}
              max={60 * 60}
              disabled={busy}
            />
          </div>

          {/*
            Coins are already credited minute by minute, so there's nothing to
            collect. Auto has no countdown though, so it still needs a way to say
            "I'm done" — that's what claims the key and sets the baseline. Manual
            ends itself at zero and never shows this.
          */}
          {mode === 'auto' && elapsed > 0 && !onBreak && (
            <Button
              variant="primary"
              className="mt-5 w-full"
              onClick={() => dispatch({ type: 'finishCycle' })}
            >
              <CheckIcon className="size-5" />
              Finish cycle · {human(elapsed)}
            </Button>
          )}
        </div>
      </div>

      {/* The "50 C to pause" warning from the design. */}
      <Modal
        open={askPause}
        onClose={() => setAskPause(false)}
        label="Pause costs coins"
        dismissible={false}
      >
        <div className="p-8 text-center">
          <p className="font-display text-4xl font-bold tracking-wide text-danger uppercase">
            {PAUSE_COST} C to pause
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
            You're {human(elapsed)} into this run. Stopping now costs{' '}
            {PAUSE_COST} coins and your streak keeps counting from where you left
            off.
          </p>
          {state.coins < PAUSE_COST && (
            <p className="mt-3 text-sm font-semibold text-danger">
              You only have {commas(state.coins)} coins — not enough to pause.
            </p>
          )}
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="primary" onClick={() => setAskPause(false)}>
              No!
            </Button>
            <Button
              variant="danger"
              disabled={state.coins < PAUSE_COST}
              onClick={() => {
                dispatch({ type: 'pause', charge: true });
                setAskPause(false);
              }}
            >
              Ok
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function TimeUnit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="tnum text-8xl leading-none font-bold text-ink">
        {value}
      </span>
      <span className="mt-1 text-xs font-semibold tracking-widest text-ink-faint uppercase">
        {label}
      </span>
    </div>
  );
}

function Chip({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <span
      className={`flex items-center gap-2 rounded-pill px-3 py-1.5 text-sm font-semibold transition-colors ${
        highlight
          ? 'bg-sage/20 text-sage-deep'
          : 'bg-surface-sunk text-ink-soft'
      }`}
    >
      {label}
      <span className="tnum text-ink">{value}</span>
    </span>
  );
}
