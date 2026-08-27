import { useState } from 'react';
import { useGame } from '../../state/game';
import type { Settings } from '../../types';
import { PlusIcon, TrashIcon } from '../icons';
import Modal from '../ui/Modal';

const ANIMATIONS: { id: Settings['smallWindowAnimation']; label: string }[] = [
  { id: 'city', label: 'City' },
  { id: 'sprout', label: 'Sprout' },
  { id: 'rain', label: 'Rain' },
];

const ALARMS = ['Chime', 'Birds', 'Bell', 'Marimba'];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SettingsPanel({ open, onClose }: Props) {
  const { state, dispatch } = useGame();
  const s = state.settings;
  const [site, setSite] = useState('');

  const patch = (p: Partial<Settings>) =>
    dispatch({ type: 'patchSettings', patch: p });

  const addSite = () => {
    const v = site.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (!v || s.blockedWebsites.includes(v)) return;
    patch({ blockedWebsites: [...s.blockedWebsites, v] });
    setSite('');
  };

  return (
    <Modal open={open} onClose={onClose} label="Settings" width="panel">
      <div className="max-h-[86vh] overflow-y-auto px-10 py-8">
        <h2 className="font-display text-center text-3xl font-bold tracking-wide text-ink uppercase">
          Settings
        </h2>

        <Section title="Timer">
          <ToggleRow
            label="Auto Start Pomo"
            hint="Begin the next focus run as soon as a break ends"
            checked={s.autoStartPomo}
            onChange={(v) => patch({ autoStartPomo: v })}
          />
          <ToggleRow
            label="Auto Start Breaks"
            hint="Drop straight into a break when a cycle finishes"
            checked={s.autoStartBreaks}
            onChange={(v) => patch({ autoStartBreaks: v })}
          />
          <Row label="Long Break Interval" hint="Every N cycles the break doubles">
            <input
              type="number"
              min={2}
              max={12}
              value={s.longBreakInterval}
              onChange={(e) =>
                patch({ longBreakInterval: Number(e.target.value) })
              }
              aria-label="Long break interval"
              className="tnum w-20 rounded-xl bg-surface px-3 py-1.5 text-center font-semibold text-ink ring-1 ring-hairline focus:ring-2 focus:ring-sage-deep focus:outline-none"
            />
          </Row>
        </Section>

        <Section title="Productivity">
          <div>
            <p className="text-sm font-semibold text-ink">Blocked Websites</p>
            <p className="mt-0.5 text-xs leading-relaxed text-ink-faint">
              Saved here, but a web page can't close your other tabs — enforcing
              this needs the browser extension or desktop app.
            </p>
            <div className="mt-3 flex gap-2">
              <input
                value={site}
                onChange={(e) => setSite(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addSite()}
                placeholder="reddit.com"
                aria-label="Website to block"
                className="flex-1 rounded-xl bg-surface px-3 py-2 text-sm text-ink ring-1 ring-hairline placeholder:text-ink-faint focus:ring-2 focus:ring-sage-deep focus:outline-none"
              />
              <button
                onClick={addSite}
                aria-label="Add website"
                className="grid size-10 place-items-center rounded-xl bg-sage-deep text-white transition-colors hover:bg-sage"
              >
                <PlusIcon className="size-5" />
              </button>
            </div>
            <ul className="mt-3 space-y-1.5">
              {s.blockedWebsites.map((w) => (
                <li
                  key={w}
                  className="flex items-center justify-between rounded-xl bg-surface-sunk px-3 py-2 text-sm text-ink"
                >
                  {w}
                  <button
                    onClick={() =>
                      patch({
                        blockedWebsites: s.blockedWebsites.filter(
                          (x) => x !== w,
                        ),
                      })
                    }
                    aria-label={`Unblock ${w}`}
                    className="text-ink-faint transition-colors hover:text-danger"
                  >
                    <TrashIcon className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <ToggleRow
            label="Recommend Break Activities"
            hint="Suggest something to do when a break starts"
            checked={s.recommendBreakActivities}
            onChange={(v) => patch({ recommendBreakActivities: v })}
          />

          <div>
            <p className="text-sm font-semibold text-ink">
              Small Window Animation
            </p>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {ANIMATIONS.map((a) => (
                <button
                  key={a.id}
                  onClick={() => patch({ smallWindowAnimation: a.id })}
                  className={`rounded-2xl py-6 text-sm font-semibold ring-1 transition-all ${
                    s.smallWindowAnimation === a.id
                      ? 'bg-sky-soft text-ink ring-sky shadow-soft'
                      : 'bg-surface-sunk text-ink-soft ring-hairline hover:ring-sky'
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </Section>

        <Section title="Sound">
          <Row label="Alarm Sound">
            <select
              value={s.alarmSound}
              onChange={(e) => patch({ alarmSound: e.target.value })}
              aria-label="Alarm sound"
              className="rounded-xl bg-surface px-3 py-1.5 text-sm font-semibold text-ink ring-1 ring-hairline focus:ring-2 focus:ring-sage-deep focus:outline-none"
            >
              {ALARMS.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </Row>
          <SliderRow
            label="Alarm Volume"
            value={s.alarmVolume}
            onChange={(v) => patch({ alarmVolume: v })}
          />
          <SliderRow
            label="Game Music"
            value={s.musicVolume}
            onChange={(v) => patch({ musicVolume: v })}
          />
          <SliderRow
            label="Game SFX Volume"
            value={s.sfxVolume}
            onChange={(v) => patch({ sfxVolume: v })}
          />
        </Section>
      </div>
    </Modal>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <h3 className="font-display border-b-2 border-ink pb-1 text-xl font-bold tracking-wide text-ink uppercase">
        {title}
      </h3>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-ink">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-ink-faint">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <Row label={label} hint={hint}>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-13 shrink-0 rounded-pill ring-1 transition-colors ${
          checked ? 'bg-sage-deep ring-sage-deep' : 'bg-surface-sunk ring-hairline'
        }`}
      >
        {/* `left-0` anchors the knob to the track — see the note in ModeToggle. */}
        <span
          className={`absolute top-1 left-0 size-5 rounded-full bg-surface shadow-soft transition-transform duration-200 ${
            checked ? 'translate-x-7' : 'translate-x-1'
          }`}
        />
      </button>
    </Row>
  );
}

function SliderRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <Row label={label}>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label={label}
          className="w-40"
        />
        <span className="tnum w-10 text-right text-sm font-semibold text-ink-soft">
          {Math.round(value * 100)}
        </span>
      </div>
    </Row>
  );
}
