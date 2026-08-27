import { kindById } from '../../catalog';
import { commas } from '../../format';
import { useGame } from '../../state/game';
import type { PlacedHouse } from '../../types';
import IsoHouse from '../city/IsoHouse';
import { CoinIcon, KeyIcon, SparkIcon, TrashIcon } from '../icons';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

interface Props {
  house: PlacedHouse | null;
  onClose: () => void;
}

/**
 * The House frame was left empty in the design, so this invents it: what the
 * building earns, what it cost you in focus time, and a rename field so the
 * city becomes personal.
 */
export default function HouseDetail({ house, onClose }: Props) {
  const { dispatch } = useGame();
  if (!house) return null;

  const kind = kindById(house.kindId);
  const built = new Date(house.builtAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Modal open onClose={onClose} label={house.name}>
      <div className="p-8">
        <div className="flex justify-center rounded-2xl bg-surface-sunk py-6">
          <svg viewBox="-70 -140 140 200" className="h-40">
            <IsoHouse kind={kind} />
          </svg>
        </div>

        <input
          value={house.name}
          onChange={(e) =>
            dispatch({
              type: 'renameHouse',
              id: house.id,
              name: e.target.value,
            })
          }
          aria-label="Building name"
          className="font-display mt-6 w-full rounded-xl bg-transparent px-2 py-1 text-center text-2xl font-bold tracking-wide text-ink uppercase transition-colors hover:bg-surface-sunk focus:bg-surface-sunk focus:outline-none"
        />
        <p className="text-center text-xs font-semibold tracking-widest text-ink-faint uppercase">
          {kind.name}
        </p>

        <dl className="mt-6 space-y-2.5 text-sm">
          <Row label="Earns each cycle">
            <span className="flex items-center gap-1.5 font-bold text-sage-deep">
              <SparkIcon className="size-4" />+{kind.yield}
            </span>
          </Row>
          <Row label="Cost to build">
            <span className="flex items-center gap-3 font-bold text-ink">
              <span className="tnum flex items-center gap-1.5">
                <CoinIcon className="size-4" />
                {commas(kind.cost)}
              </span>
              <span className="tnum flex items-center gap-1.5">
                <KeyIcon className="size-4" />
                {kind.keyCost}
              </span>
            </span>
          </Row>
          <Row label="Built on">
            <span className="font-semibold text-ink">{built}</span>
          </Row>
          <Row label="Focus banked by then">
            <span className="tnum font-semibold text-ink">
              {commas(house.builtAfterMinutes)} min
            </span>
          </Row>
        </dl>

        <Button
          variant="danger"
          className="mt-6 w-full"
          onClick={() => {
            dispatch({ type: 'sellHouse', id: house.id });
            onClose();
          }}
        >
          <TrashIcon className="size-4" />
          Demolish · refunds {commas(Math.floor(kind.cost / 2))} coins and{' '}
          {kind.keyCost} {kind.keyCost === 1 ? 'key' : 'keys'}
        </Button>
      </div>
    </Modal>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b border-hairline pb-2.5 last:border-0">
      <dt className="text-ink-soft">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
