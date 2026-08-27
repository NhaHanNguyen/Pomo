import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'soft' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const variants: Record<Variant, string> = {
  primary:
    'bg-sage-deep text-white shadow-soft hover:bg-sage hover:shadow-lift active:translate-y-px',
  soft: 'bg-surface text-ink ring-1 ring-hairline shadow-soft hover:bg-plaster hover:shadow-lift active:translate-y-px',
  ghost: 'text-ink-soft hover:bg-surface-sunk hover:text-ink',
  danger:
    'bg-surface text-danger ring-1 ring-danger/30 hover:bg-danger hover:text-white hover:ring-danger active:translate-y-px',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-11 px-5 text-base',
  lg: 'h-14 px-7 text-lg',
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

export default function Button({
  variant = 'soft',
  size = 'md',
  className = '',
  children,
  ...rest
}: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-pill font-semibold transition-all duration-150 focus-visible:ring-2 focus-visible:ring-sage-deep focus-visible:ring-offset-2 focus-visible:ring-offset-canvas focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40 ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
