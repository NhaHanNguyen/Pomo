import { useState } from 'react';
import { CATALOG, CATEGORIES } from '../../catalog';
import { commas } from '../../format';
import {
  CITY_PAYOUT_MIN_SECONDS,
  type HouseCategory,
  type HouseKind,
} from '../../types';
import { CoinIcon, KeyIcon, SparkIcon } from '../icons';

interface Props {
  coins: number;
  keys: number;
  selected: HouseKind | null;
  onSelect: (kind: HouseKind | null) => void;
}

/** The right-hand shop overlay: 4 category tabs over a scrolling item list. */
export default function ShopPanel({
  coins,
  keys,
  selected,
  onSelect,
}: Props) {
  const [category, setCategory] = useState<HouseCategory>('homes');
  const items = CATALOG.filter((k) => k.category === category);

  return (
    /*
      `pt-20` keeps the category tabs clear of the coins/keys HUD, which floats
      over this panel's top-right corner.
    */
    <aside className="shadow-pop flex h-full w-[365px] flex-col bg-surface/95 pt-20 ring-1 ring-hairline backdrop-blur-md">
      <div className="grid grid-cols-4 border-y border-hairline">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={`py-4 text-sm font-bold transition-colors ${
              category === c.id
                ? 'bg-sky-soft text-ink'
                : 'text-ink-faint hover:bg-surface-sunk hover:text-ink-soft'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {items.map((kind) => {
          const affordable = coins >= kind.cost && keys >= kind.keyCost;
          const active = selected?.id === kind.id;
          return (
            <button
              key={kind.id}
              onClick={() => onSelect(active ? null : kind)}
              disabled={!affordable}
              className={`w-full rounded-2xl p-4 text-left ring-1 transition-all duration-150 ${
                active
                  ? 'bg-sky-soft ring-sky shadow-lift'
                  : 'bg-surface ring-hairline hover:shadow-soft hover:ring-sky'
              } ${affordable ? '' : 'cursor-not-allowed opacity-45'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-ink">{kind.name}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-sage-deep">
                    <SparkIcon className="size-3" />+{kind.yield} coins / cycle
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span
                    className={`tnum flex items-center gap-1.5 text-sm font-bold ${
                      coins >= kind.cost ? 'text-ink' : 'text-danger'
                    }`}
                  >
                    <CoinIcon className="size-4" />
                    {commas(kind.cost)}
                  </span>
                  <span
                    className={`tnum flex items-center gap-1.5 text-sm font-bold ${
                      keys >= kind.keyCost ? 'text-ink' : 'text-danger'
                    }`}
                  >
                    <KeyIcon className="size-4" />
                    {kind.keyCost}
                  </span>
                </div>
              </div>
              {active && (
                <p className="mt-3 text-xs font-semibold text-ink-soft">
                  Pick an empty plot to build →
                </p>
              )}
            </button>
          );
        })}
      </div>

      <p className="border-t border-hairline p-4 text-xs leading-relaxed text-ink-faint">
        Coins come from focusing, faster the longer you hold. Keys come from
        finishing cycles — one each. Buildings pay their yield on any cycle of{' '}
        {CITY_PAYOUT_MIN_SECONDS / 60} minutes or more.
      </p>
    </aside>
  );
}
