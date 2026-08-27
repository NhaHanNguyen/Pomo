import { useState } from 'react';
import LoginScreen from './components/auth/LoginScreen';
import CityScreen from './components/city/CityScreen';
import { GearIcon } from './components/icons';
import SettingsPanel from './components/settings/SettingsPanel';
import CoinToasts from './components/shell/CoinToasts';
import CurrencyHud from './components/shell/CurrencyHud';
import HelpButton from './components/shell/HelpButton';
import TabBar from './components/shell/TabBar';
import CycleComplete from './components/timer/CycleComplete';
import TimerScreen from './components/timer/TimerScreen';
import Button from './components/ui/Button';
import Modal from './components/ui/Modal';
import { GameProvider, useGame } from './state/game';
import type { Tab } from './types';

export default function App() {
  const [entered, setEntered] = useState(false);

  return (
    <GameProvider>
      {entered ? (
        <AppShell />
      ) : (
        <LoginScreen onEnter={() => setEntered(true)} />
      )}
    </GameProvider>
  );
}

function AppShell() {
  const { state, dispatch } = useGame();
  const [tab, setTab] = useState<Tab>('timer');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      {/*
        Top chrome. The bar spans the full width, so it must not eat pointer
        events in the empty middle — that was swallowing clicks meant for the
        shop panel underneath. Only the two clusters take input.
      */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between p-6">
        <div className="pointer-events-auto flex items-center gap-3">
          {/*
            The design puts a hard red RESET here. Keeping it visible but
            confirming first — it wipes coins, keys and the whole city.
          */}
          <Button
            variant="danger"
            size="sm"
            onClick={() => setConfirmReset(true)}
            className="tracking-[0.2em] uppercase"
          >
            Reset
          </Button>
          <button
            onClick={() => setSettingsOpen(true)}
            aria-label="Settings"
            className="grid size-10 place-items-center rounded-full bg-surface/80 text-ink-soft ring-1 ring-hairline backdrop-blur-sm transition-colors hover:text-ink"
          >
            <GearIcon className="size-5" />
          </button>
        </div>

        <div className="pointer-events-auto">
          <CurrencyHud coins={state.coins} keys={state.keys} />
        </div>
      </header>

      {/* Coins accruing this cycle, drifting up toward the HUD. */}
      <CoinToasts />

      {/* Screens */}
      <main className="min-h-0 flex-1">
        {tab === 'timer' ? <TimerScreen /> : <CityScreen />}
      </main>

      {/* Bottom chrome */}
      <div className="absolute bottom-6 left-6 z-30">
        <HelpButton />
      </div>
      {/*
        Same trap as the header: this strip spans the full width, so it has to
        stay transparent to clicks or it swallows the help button in the corner.
      */}
      <div className="pointer-events-none absolute inset-x-0 bottom-6 z-30 flex justify-center">
        <TabBar tab={tab} onChange={setTab} />
      </div>

      {/* Fires wherever you are when a cycle lands. */}
      <CycleComplete />

      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      <Modal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        label="Reset progress"
      >
        <div className="p-8 text-center">
          <p className="font-display text-3xl font-bold tracking-wide text-danger uppercase">
            Reset everything?
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
            This clears your coins, keys, cycle count and every building in your
            city. Your settings are kept. There's no undo.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="soft" onClick={() => setConfirmReset(false)}>
              Keep my city
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                dispatch({ type: 'resetAll' });
                setConfirmReset(false);
              }}
            >
              Reset
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
