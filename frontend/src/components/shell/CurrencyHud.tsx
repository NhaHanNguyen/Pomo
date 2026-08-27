import { commas } from '../../format';
import { CoinIcon, KeyIcon } from '../icons';

interface Props {
  coins: number;
  keys: number;
}

/**
 * Top-right HUD from the design. Keys are build permits — you earn one per
 * completed cycle, so they gate how fast the city can grow no matter how many
 * coins you've banked.
 */
export default function CurrencyHud({ coins, keys }: Props) {
  return (
    <div className="flex items-center gap-2 rounded-pill bg-surface/80 px-4 py-2 ring-1 ring-hairline backdrop-blur-sm">
      <span
        className="flex items-center gap-2"
        title={`${commas(coins)} coins — earned by focusing`}
      >
        <CoinIcon className="size-6" />
        <span className="tnum text-xl font-semibold text-ink">
          {commas(coins)}
        </span>
      </span>
      <span className="h-5 w-px bg-hairline" aria-hidden />
      <span
        className="flex items-center gap-2 text-ink"
        title={`${keys} keys — one per completed cycle, spent on new buildings`}
      >
        <KeyIcon className="size-6" />
        <span className="tnum text-xl font-semibold">{keys}</span>
      </span>
    </div>
  );
}
