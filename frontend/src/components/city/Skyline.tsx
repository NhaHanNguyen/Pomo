/**
 * Decorative rooftops for the Timer screen. The design left a lot of empty
 * canvas around the clock; a soft skyline fills it and keeps the city present
 * while you focus, without competing with the numerals.
 */
export default function Skyline({ dimmed = false }: { dimmed?: boolean }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 bottom-0 transition-opacity duration-1000 ${
        dimmed ? 'opacity-30' : 'opacity-70'
      }`}
    >
      <svg
        viewBox="0 0 1440 260"
        preserveAspectRatio="none"
        className="h-[260px] w-full"
      >
        {/* Far hills */}
        <path
          d="M0 200 Q 180 140 360 185 T 720 170 T 1080 195 T 1440 160 V260 H0Z"
          fill="var(--color-sage)"
          opacity={0.28}
        />
        {/* Mid rooftops */}
        <g fill="var(--color-terracotta)" opacity={0.3}>
          <path d="M120 230 L180 186 L240 230 Z" />
          <path d="M300 230 L372 176 L444 230 Z" />
          <path d="M560 230 L620 188 L680 230 Z" />
          <path d="M820 230 L890 178 L960 230 Z" />
          <path d="M1120 230 L1178 190 L1236 230 Z" />
        </g>
        <g fill="var(--color-sky)" opacity={0.26}>
          <path d="M210 230 L266 192 L322 230 Z" />
          <path d="M690 230 L752 182 L814 230 Z" />
          <path d="M990 230 L1046 194 L1102 230 Z" />
        </g>
        {/* Near walls */}
        <g fill="var(--color-plaster)">
          <rect x="120" y="228" width="120" height="40" />
          <rect x="300" y="228" width="144" height="40" />
          <rect x="560" y="228" width="120" height="40" />
          <rect x="820" y="228" width="140" height="40" />
          <rect x="1120" y="228" width="116" height="40" />
        </g>
        <rect
          x="0"
          y="246"
          width="1440"
          height="20"
          fill="var(--color-surface-sunk)"
        />
      </svg>
    </div>
  );
}
