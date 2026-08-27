import { useEffect, useState, type ReactNode } from 'react';
import {
  CITY_PAYOUT_MIN_SECONDS,
  COIN_TIERS,
  KEYS_PER_CYCLE,
  PAUSE_COST,
} from '../../types';
import { CoinIcon, HelpIcon, KeyIcon } from '../icons';
import Modal from '../ui/Modal';

const SEEN_KEY = 'pomo:seen-help';

type Section = 'start' | 'faq' | 'economy';

/**
 * The `?` in the bottom-left of every frame. Until it's been opened once it
 * shows a label instead of a bare icon — a lone question mark isn't a strong
 * enough affordance for someone opening the app for the first time.
 */
export default function HelpButton() {
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState<Section>('start');
  const [seen, setSeen] = useState(true);

  useEffect(() => {
    setSeen(localStorage.getItem(SEEN_KEY) === '1');
  }, []);

  const show = () => {
    setOpen(true);
    setSeen(true);
    localStorage.setItem(SEEN_KEY, '1');
  };

  return (
    <>
      <button
        onClick={show}
        aria-label="How Pomo works"
        className={`flex items-center gap-2 rounded-pill bg-surface/85 text-ink-soft ring-1 ring-hairline backdrop-blur-sm transition-all hover:text-ink hover:shadow-soft ${
          seen ? 'size-11 justify-center' : 'h-11 px-4 ring-sage shadow-soft'
        }`}
      >
        <HelpIcon className="size-6 shrink-0" />
        {!seen && (
          <span className="text-sm font-bold whitespace-nowrap">
            New? Start here
          </span>
        )}
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        label="How Pomo works"
        width="panel"
      >
        <div className="border-b border-hairline px-8 pt-8">
          <h2 className="font-display text-3xl font-bold tracking-wide text-ink uppercase">
            How Pomo works
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Coins for every second you focus, faster the longer you hold. Keys
            for finishing cycles. Spend both to build a city that pays you back.
          </p>
          <nav className="mt-5 -mb-px flex gap-1">
            {(
              [
                ['start', 'Getting started'],
                ['economy', 'Coins & keys'],
                ['faq', 'FAQ'],
              ] as [Section, string][]
            ).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setSection(id)}
                className={`rounded-t-xl px-4 py-2.5 text-sm font-bold transition-colors ${
                  section === id
                    ? 'bg-sky-soft text-ink'
                    : 'text-ink-faint hover:bg-surface-sunk hover:text-ink-soft'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>

        <div className="overflow-y-auto px-8 py-6">
          {section === 'start' && <GettingStarted />}
          {section === 'economy' && <Economy />}
          {section === 'faq' && <Faq />}
        </div>
      </Modal>
    </>
  );
}

function GettingStarted() {
  return (
    <ol className="space-y-4">
      <Step n={1} title="Pick a mode on the Timer tab">
        You start in <strong className="text-ink">Manual</strong>: a classic
        Pomodoro that counts <em>down</em> from a length you set and ends itself
        at zero. Nothing to learn — just press play.
        <br />
        Flip to <strong className="text-ink">Auto</strong> when you want a
        challenge: it counts <em>up</em> with no end and pausing costs{' '}
        {PAUSE_COST} coins. Your first Auto run measures your baseline — how long
        you actually focus — and later Auto runs chase it.
      </Step>
      <Step n={2} title="Press the green play button">
        Coins start landing every second — and the rate climbs the longer you
        hold on, so the back half of a long run pays far better than the front.
      </Step>
      <Step n={3} title="Finish the cycle">
        Manual ends itself at zero. Auto has no countdown, so you decide when to
        stop — press <strong className="text-ink">Finish cycle</strong>. Either
        way, completing a cycle pays {KEYS_PER_CYCLE} key.
      </Step>
      <Step n={4} title="Take the break">
        A break starts automatically. Skip it any time.
      </Step>
      <Step n={5} title="Switch to the City tab and build">
        Click something in the shop on the right, then click an empty plot on the
        map. Your first Small House costs 200 coins and 1 key.
      </Step>
      <Step n={6} title="Get paid forever">
        Every building adds coins to every future cycle of{' '}
        {CITY_PAYOUT_MIN_SECONDS / 60} minutes or more. A bigger city means every
        real focus session is worth more. A Small House pays for itself in about
        thirty cycles, then it's profit.
      </Step>
    </ol>
  );
}

function Economy() {
  return (
    <div className="space-y-5 text-[15px] leading-relaxed text-ink-soft">
      <div className="flex gap-4 rounded-2xl bg-surface-sunk p-4">
        <CoinIcon className="mt-0.5 size-7 shrink-0" />
        <div>
          <p className="font-bold text-ink">Coins — the grind</p>
          <p className="mt-1">
            Credited every second, straight into your balance — you'll see each
            one pop up and drift into the counter. The rate escalates the deeper
            into a cycle you get:
          </p>
          <ul className="mt-2 space-y-1">
            {COIN_TIERS.map((t, i) => {
              const next = COIN_TIERS[i + 1];
              return (
                <li key={t.fromMinute} className="flex justify-between text-sm">
                  <span>
                    {next
                      ? `${t.fromMinute}\u2013${next.fromMinute} minutes`
                      : `${t.fromMinute}+ minutes`}
                  </span>
                  <span className="tnum font-bold text-ink">
                    {t.perSecond} / second
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-2">
            Your buildings pay their yield on top, once per completed cycle — but
            only on cycles of {CITY_PAYOUT_MIN_SECONDS / 60} minutes or more, so
            short cycles can't farm a big city.
          </p>
        </div>
      </div>

      <div className="flex gap-4 rounded-2xl bg-surface-sunk p-4">
        <KeyIcon className="mt-0.5 size-7 shrink-0 text-ink" />
        <div>
          <p className="font-bold text-ink">Keys — the pace</p>
          <p className="mt-1">
            {KEYS_PER_CYCLE} per <em>completed</em> cycle, no matter how long it
            was. Buildings need keys as well as coins, so you can't buy your way
            to a big city in one marathon session — you have to keep showing up.
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-danger/8 p-4 ring-1 ring-danger/20">
        <p className="font-bold text-ink">Why pausing costs {PAUSE_COST} coins</p>
        <p className="mt-1">
          In both modes. Stopping partway is the thing the app is built to
          discourage, so it has to cost you something real. Coins you already
          earned this run stay yours — the charge comes out of your balance.
        </p>
      </div>
    </div>
  );
}

function Faq() {
  return (
    <div className="divide-y divide-hairline">
      <Q q="Which mode should I use?">
        Manual, if you're new or want a predictable 25 minutes. Auto, if you want
        to push for a long session and have your best time recorded.
      </Q>
      <Q q="What is the baseline, and why can't I type it?">
        Because it's measured, not guessed. The very first Auto run you finish
        becomes your baseline — that's your real attention span, not one you
        estimated. Every Auto run after that is scored against it, and the chip
        turns green once you pass it. Manual mode ignores the baseline entirely
        and just uses the focus time you set.
      </Q>
      <Q q="Can I redo my baseline?">
        Yes — hit <strong className="text-ink">Recalibrate</strong> next to it in
        Auto mode. That clears it, and your next Auto run measures a fresh one.
        Worth doing if your focus has genuinely changed.
      </Q>
      <Q q="What's the high score?">
        The longest single focus run you've ever completed. Beat it and you'll see a
        “New personal best!” flash under the clock.
      </Q>
      <Q q="When do I actually get my coins?">
        As you earn them. Every second of focus adds coins straight to your
        balance — there's no collect step. Completing a cycle additionally pays{' '}
        {KEYS_PER_CYCLE} key and your buildings' yield, and you'll get a recap
        breaking down which came from where.
      </Q>
      <Q q="Why did my coins speed up?">
        By design. The rate steps up at {COIN_TIERS.slice(1)
          .map((t) => `${t.fromMinute}`)
          .join(', ')} minutes, so a long unbroken run is worth much more than
        the same time chopped into short ones. It's the whole reason quitting
        early stings.
      </Q>
      <Q q="What ends a cycle?">
        In Manual, hitting zero. In Auto there's no countdown, so you press{' '}
        <strong className="text-ink">Finish cycle</strong> when your focus runs
        out. Completing a cycle is what pays the key, bumps your cycle counter,
        and records your high score.
      </Q>
      <Q q="How do I abandon a run I don't want to count?">
        Pause first, then <strong className="text-ink">Give up on this cycle and
        start over</strong> appears under the clock. You keep the coins you
        already earned, but forfeit this cycle's key and its shot at your high
        score. It's deliberately behind the pause fee — otherwise quitting would
        be free and the {PAUSE_COST} coins would mean nothing.
      </Q>
      <Q q="I clicked a building in the shop but nothing happened.">
        Selecting only arms it — you still have to click an empty plot on the
        map. A banner appears at the bottom while you're placing. If the item
        looks faded, you can't afford its coins or its keys yet.
      </Q>
      <Q q="Can I get rid of a building?">
        Click it on the map, then <strong className="text-ink">Demolish</strong>.
        You get half the coins back and all of the keys.
      </Q>
      <Q q="Do the blocked websites actually get blocked?">
        Not yet — and this is worth being clear about. A web page has no power to
        close or block your other tabs. The list saves, but enforcing it needs a
        browser extension or a desktop version of Pomo.
      </Q>
      <Q q="What's the long break interval?">
        In Settings. Every N cycles, your break is doubled. Default is every 4.
      </Q>
      <Q q="Does my progress save?">
        Yes, in this browser. A running timer is deliberately <em>not</em>{' '}
        restored on reload — a refresh shouldn't quietly keep counting minutes
        you didn't focus.
      </Q>
      <Q q="What does the red RESET button do?">
        Wipes your coins, keys, cycle count and every building. It asks first.
        Your settings survive. There's no undo.
      </Q>
      <Q q="Why can't I switch modes mid-session?">
        The two modes score differently, so swapping halfway would make the
        result meaningless. Finish or restart the cycle first.
      </Q>
    </div>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <li className="flex gap-4">
      <span className="tnum grid size-8 shrink-0 place-items-center rounded-full bg-sage-deep text-sm font-bold text-white">
        {n}
      </span>
      <div>
        <p className="font-bold text-ink">{title}</p>
        <p className="mt-0.5 text-[15px] leading-relaxed text-ink-soft">
          {children}
        </p>
      </div>
    </li>
  );
}

function Q({ q, children }: { q: string; children: ReactNode }) {
  return (
    <details className="group py-3">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-ink marker:content-none">
        {q}
        <span className="shrink-0 text-xl leading-none text-ink-faint transition-transform group-open:rotate-45">
          +
        </span>
      </summary>
      <p className="mt-2 pr-8 text-[15px] leading-relaxed text-ink-soft">
        {children}
      </p>
    </details>
  );
}
