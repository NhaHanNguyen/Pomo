import type { SVGProps } from 'react';

type Icon = (props: SVGProps<SVGSVGElement>) => React.JSX.Element;

const base: SVGProps<SVGSVGElement> = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export const CoinIcon: Icon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
    <circle cx="12" cy="12" r="9.5" fill="var(--color-coin)" />
    <circle cx="12" cy="12" r="9.5" stroke="#c8930f" strokeWidth="1.5" />
    <path
      d="M15 8.8a4.2 4.2 0 1 0 0 6.4"
      stroke="#8a6205"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
  </svg>
);

export const KeyIcon: Icon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
    <circle
      cx="16.5"
      cy="7.5"
      r="4"
      stroke="currentColor"
      strokeWidth="2"
      fill="var(--color-sand)"
    />
    <path
      d="M13.6 10.4 4.5 19.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M7.5 16.5l2 2M5.5 18.5l2 2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const PlayIcon: Icon = (props) => (
  <svg viewBox="0 0 24 24" aria-hidden {...props}>
    <path d="M8 5.5v13a1 1 0 0 0 1.54.84l10-6.5a1 1 0 0 0 0-1.68l-10-6.5A1 1 0 0 0 8 5.5Z" fill="currentColor" />
  </svg>
);

export const PauseIcon: Icon = (props) => (
  <svg viewBox="0 0 24 24" aria-hidden {...props}>
    <rect x="6" y="5" width="4.5" height="14" rx="1.6" fill="currentColor" />
    <rect x="13.5" y="5" width="4.5" height="14" rx="1.6" fill="currentColor" />
  </svg>
);

export const CheckIcon: Icon = (props) => (
  <svg {...base} aria-hidden {...props}>
    <path d="M5 13l4.5 4.5L19 7" />
  </svg>
);

/*
  A real cog outline rather than a circle with spokes — the old version read as a
  sun. Teeth alternate between a tip and a root radius, computed once at module
  load so the tooth count stays a single number to tweak.
*/
const COG_PATH = (() => {
  const teeth = 8;
  const tip = 10.6;
  const root = 7.7;
  const step = Math.PI / teeth; // half of one tooth-plus-gap
  const tipHalf = step * 0.44;
  const rootHalf = step * 0.94;

  const at = (r: number, a: number) =>
    `${(12 + r * Math.cos(a)).toFixed(2)},${(12 + r * Math.sin(a)).toFixed(2)}`;

  const points: string[] = [];
  for (let i = 0; i < teeth; i++) {
    const c = (i * 2 * Math.PI) / teeth;
    points.push(
      at(root, c - rootHalf),
      at(tip, c - tipHalf),
      at(tip, c + tipHalf),
      at(root, c + rootHalf),
    );
  }
  return `M${points.join('L')}Z`;
})();

export const GearIcon: Icon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinejoin="round"
    aria-hidden
    {...props}
  >
    <path d={COG_PATH} />
    <circle cx="12" cy="12" r="3.1" />
  </svg>
);

export const RedoIcon: Icon = (props) => (
  <svg {...base} aria-hidden {...props}>
    <path d="M20 5v5h-5" />
    <path d="M19.4 14a7.6 7.6 0 1 1-1.7-7.7L20 8.6" />
  </svg>
);

export const HelpIcon: Icon = (props) => (
  <svg {...base} aria-hidden {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.4 9.2a2.7 2.7 0 1 1 3.7 2.5c-.7.3-1.1 1-1.1 1.8v.4" />
    <path d="M12 17.4h.01" strokeWidth="2.6" />
  </svg>
);

export const CloseIcon: Icon = (props) => (
  <svg {...base} aria-hidden {...props}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const ChevronLeftIcon: Icon = (props) => (
  <svg {...base} aria-hidden {...props}>
    <path d="M14.5 5.5 8 12l6.5 6.5" />
  </svg>
);

export const ChevronRightIcon: Icon = (props) => (
  <svg {...base} aria-hidden {...props}>
    <path d="M9.5 5.5 16 12l-6.5 6.5" />
  </svg>
);

export const ChevronUpIcon: Icon = (props) => (
  <svg {...base} aria-hidden {...props}>
    <path d="M5.5 14.5 12 8l6.5 6.5" />
  </svg>
);

export const ChevronDownIcon: Icon = (props) => (
  <svg {...base} aria-hidden {...props}>
    <path d="M5.5 9.5 12 16l6.5-6.5" />
  </svg>
);

export const PlusIcon: Icon = (props) => (
  <svg {...base} aria-hidden {...props}>
    <path d="M12 5.5v13M5.5 12h13" />
  </svg>
);

export const TrashIcon: Icon = (props) => (
  <svg {...base} aria-hidden {...props}>
    <path d="M4 7h16M9.5 7V4.8h5V7M6.5 7l.8 12.2h9.4L17.5 7" />
  </svg>
);

export const TimerTabIcon: Icon = (props) => (
  <svg {...base} aria-hidden {...props}>
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4l2.6 1.8M9 2.6h6" />
  </svg>
);

export const CityTabIcon: Icon = (props) => (
  <svg {...base} aria-hidden {...props}>
    <path d="M3 20.5h18" />
    <path d="M5 20.5v-8l4-3 4 3v8" />
    <path d="M13 20.5v-11l3-2.2 3 2.2v11" />
  </svg>
);

export const SparkIcon: Icon = (props) => (
  <svg viewBox="0 0 24 24" aria-hidden {...props}>
    <path
      d="M12 3l1.9 5.4L19.3 10l-5.4 1.6L12 17l-1.9-5.4L4.7 10l5.4-1.6L12 3Z"
      fill="currentColor"
    />
  </svg>
);
