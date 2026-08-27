import type { HouseKind } from '../../types';

/** Isometric tile geometry. A tile is twice as wide as it is tall. */
export const TILE_W = 96;
export const TILE_H = 48;
const HW = TILE_W / 2;
const HH = TILE_H / 2;

/** Grid coordinates -> screen offset, standard 2:1 isometric projection. */
export function isoToScreen(gx: number, gy: number) {
  return { x: (gx - gy) * HW, y: (gx + gy) * HH };
}

const poly = (pts: [number, number][]) =>
  pts.map(([x, y]) => `${x},${y}`).join(' ');

interface Props {
  kind: HouseKind;
  /** Renders the plot outline only, for the placement preview. */
  ghost?: boolean;
}

/**
 * A cute isometric building drawn from three visible faces plus a hip roof.
 * Left-hand faces get a translucent black overlay so the whole city is lit
 * consistently from the right without needing per-colour shade constants.
 */
export default function IsoHouse({ kind, ghost = false }: Props) {
  const bodyH = 28 + kind.size * 16;
  const roofH = 20 + kind.size * 6;

  // Base diamond, centred on the tile.
  const base: [number, number][] = [
    [0, -HH],
    [HW, 0],
    [0, HH],
    [-HW, 0],
  ];
  const top: [number, number][] = base.map(([x, y]) => [x, y - bodyH]);
  const apex: [number, number] = [0, -HH - bodyH - roofH];

  if (ghost) {
    return (
      <g>
        <polygon
          points={poly(base)}
          fill="var(--color-sage)"
          fillOpacity={0.25}
          stroke="var(--color-sage-deep)"
          strokeWidth={2}
          strokeDasharray="6 5"
        />
      </g>
    );
  }

  return (
    <g>
      {/* Ground plot */}
      <polygon points={poly(base)} fill="var(--color-sand)" />
      <polygon points={poly(base)} fill="#000" opacity={0.06} />

      {/* Right wall (lit) */}
      <polygon
        points={poly([
          [0, HH],
          [HW, 0],
          [HW, -bodyH],
          [0, HH - bodyH],
        ])}
        fill={kind.palette.wall}
      />
      {/* Left wall (shaded) */}
      <polygon
        points={poly([
          [-HW, 0],
          [0, HH],
          [0, HH - bodyH],
          [-HW, -bodyH],
        ])}
        fill={kind.palette.wall}
      />
      <polygon
        points={poly([
          [-HW, 0],
          [0, HH],
          [0, HH - bodyH],
          [-HW, -bodyH],
        ])}
        fill="#000"
        opacity={0.14}
      />

      {/* Roof: two visible faces of a hip roof */}
      <polygon
        points={poly([top[2], top[1], apex])}
        fill={kind.palette.roof}
      />
      <polygon points={poly([top[3], top[2], apex])} fill={kind.palette.roof} />
      <polygon
        points={poly([top[3], top[2], apex])}
        fill="#000"
        opacity={0.16}
      />
      {/* Eaves */}
      <polyline
        points={poly([top[3], top[2], top[1]])}
        fill="none"
        stroke={kind.palette.trim}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />

      {/* Windows, one per storey on each visible wall */}
      {Array.from({ length: kind.size }).map((_, i) => {
        const wy = -12 - i * 18;
        return (
          <g key={i}>
            <polygon
              points={poly([
                [22, wy + 2],
                [38, wy - 6],
                [38, wy - 20],
                [22, wy - 12],
              ])}
              fill="var(--color-sky-soft)"
              stroke={kind.palette.trim}
              strokeWidth={1.5}
            />
            <polygon
              points={poly([
                [-38, wy - 6],
                [-22, wy + 2],
                [-22, wy - 12],
                [-38, wy - 20],
              ])}
              fill="var(--color-sky-soft)"
              stroke={kind.palette.trim}
              strokeWidth={1.5}
              opacity={0.75}
            />
          </g>
        );
      })}

      {/* Door on the lit face */}
      <polygon
        points={poly([
          [4, HH - 2],
          [16, HH - 8],
          [16, HH - 28],
          [4, HH - 22],
        ])}
        fill={kind.palette.trim}
      />
    </g>
  );
}
