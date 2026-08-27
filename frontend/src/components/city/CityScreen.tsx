import { useMemo, useState } from 'react';
import { kindById } from '../../catalog';
import { useGame } from '../../state/game';
import type { HouseKind, PlacedHouse } from '../../types';
import { ChevronLeftIcon, ChevronRightIcon } from '../icons';
import HouseDetail from '../house/HouseDetail';
import IsoHouse, { TILE_H, TILE_W, isoToScreen } from './IsoHouse';
import ShopPanel from './ShopPanel';

const GRID = 8;
const PAN_STEP = TILE_W;

export default function CityScreen() {
  const { state, dispatch } = useGame();
  const [pending, setPending] = useState<HouseKind | null>(null);
  const [openHouse, setOpenHouse] = useState<string | null>(null);
  const [panX, setPanX] = useState(0);

  /**
   * Isometric depth sorting: tiles further back (smaller gx+gy) must paint
   * first so nearer buildings overlap them correctly.
   */
  const tiles = useMemo(() => {
    const out: { gx: number; gy: number; house?: PlacedHouse }[] = [];
    for (let gx = 0; gx < GRID; gx++) {
      for (let gy = 0; gy < GRID; gy++) {
        out.push({
          gx,
          gy,
          house: state.houses.find((h) => h.gx === gx && h.gy === gy),
        });
      }
    }
    return out.sort((a, b) => a.gx + a.gy - (b.gx + b.gy));
  }, [state.houses]);

  const handleTile = (gx: number, gy: number, house?: PlacedHouse) => {
    if (house) {
      setOpenHouse(house.id);
      return;
    }
    if (!pending) return;
    dispatch({ type: 'buy', kindId: pending.id, gx, gy });
    setPending(null);
  };

  const detail = state.houses.find((h) => h.id === openHouse) ?? null;

  // Centre the grid in the viewport.
  const originX = 720;
  const originY = 180;

  return (
    <div className="relative flex h-full">
      <div className="relative flex-1 overflow-hidden">
        <svg
          viewBox="0 0 1075 900"
          className="h-full w-full"
          role="img"
          aria-label={`Your city: ${state.houses.length} buildings`}
        >
          <defs>
            <radialGradient id="ground" cx="50%" cy="40%" r="70%">
              <stop offset="0%" stopColor="var(--color-sage)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--color-sage)" stopOpacity="0.08" />
            </radialGradient>
          </defs>
          <rect width="1075" height="900" fill="url(#ground)" />

          <g transform={`translate(${originX - panX} ${originY})`}>
            {tiles.map(({ gx, gy, house }) => {
              const { x, y } = isoToScreen(gx, gy);
              const isTarget = pending && !house;
              return (
                <g
                  key={`${gx},${gy}`}
                  transform={`translate(${x} ${y})`}
                  onClick={() => handleTile(gx, gy, house)}
                  className={
                    house || isTarget ? 'cursor-pointer' : 'cursor-default'
                  }
                >
                  {house ? (
                    <IsoHouse kind={kindById(house.kindId)} />
                  ) : (
                    <polygon
                      points={`0,${-TILE_H / 2} ${TILE_W / 2},0 0,${
                        TILE_H / 2
                      } ${-TILE_W / 2},0`}
                      fill={isTarget ? 'var(--color-sage)' : 'transparent'}
                      fillOpacity={isTarget ? 0.18 : 0}
                      stroke="var(--color-sage-deep)"
                      strokeOpacity={isTarget ? 0.5 : 0.12}
                      strokeWidth={isTarget ? 2 : 1}
                      strokeDasharray={isTarget ? '6 5' : undefined}
                      className="transition-all duration-150 hover:fill-sage/25"
                    />
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Pan controls, matching the left/right arrows in the design. */}
        <button
          onClick={() => setPanX((x) => x - PAN_STEP)}
          aria-label="Pan left"
          className="absolute top-1/2 left-6 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-surface/85 text-ink-soft ring-1 ring-hairline backdrop-blur-sm transition-all hover:scale-105 hover:text-ink"
        >
          <ChevronLeftIcon className="size-6" />
        </button>
        <button
          onClick={() => setPanX((x) => x + PAN_STEP)}
          aria-label="Pan right"
          className="absolute top-1/2 right-6 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-surface/85 text-ink-soft ring-1 ring-hairline backdrop-blur-sm transition-all hover:scale-105 hover:text-ink"
        >
          <ChevronRightIcon className="size-6" />
        </button>

        {state.houses.length === 0 && !pending && (
          <div className="pointer-events-none absolute inset-x-0 top-1/3 text-center">
            <p className="font-display text-2xl font-bold tracking-wide text-ink-faint uppercase">
              Empty lot
            </p>
            <p className="mt-1 text-sm text-ink-faint">
              Pick something from the shop to start building.
            </p>
          </div>
        )}

        {pending && (
          <div className="animate-pop-in absolute bottom-28 left-1/2 -translate-x-1/2 rounded-pill bg-ink px-5 py-2.5 text-sm font-semibold text-white">
            Placing {pending.name} — click a plot, or{' '}
            <button
              onClick={() => setPending(null)}
              className="underline underline-offset-2"
            >
              cancel
            </button>
          </div>
        )}
      </div>

      <ShopPanel
        coins={state.coins}
        keys={state.keys}
        selected={pending}
        onSelect={setPending}
      />

      <HouseDetail house={detail} onClose={() => setOpenHouse(null)} />
    </div>
  );
}
