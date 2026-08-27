import type { Tab } from '../../types';
import { CityTabIcon, TimerTabIcon } from '../icons';

interface Props {
  tab: Tab;
  onChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; Icon: typeof TimerTabIcon }[] = [
  { id: 'timer', label: 'Timer', Icon: TimerTabIcon },
  { id: 'city', label: 'City', Icon: CityTabIcon },
];

export default function TabBar({ tab, onChange }: Props) {
  return (
    <nav
      aria-label="Main"
      className="shadow-lift pointer-events-auto flex gap-1 rounded-pill bg-surface/90 p-1.5 ring-1 ring-hairline backdrop-blur-md"
    >
      {tabs.map(({ id, label, Icon }) => {
        const active = tab === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            aria-current={active ? 'page' : undefined}
            className={`flex h-12 w-[132px] items-center justify-center gap-2 rounded-pill text-lg font-semibold transition-all duration-200 focus-visible:ring-2 focus-visible:ring-sage-deep focus-visible:outline-none ${
              active
                ? 'bg-sky-soft text-ink shadow-soft'
                : 'text-ink-faint hover:bg-surface-sunk hover:text-ink-soft'
            }`}
          >
            <Icon className="size-5" />
            {label}
          </button>
        );
      })}
    </nav>
  );
}
