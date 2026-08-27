import { useEffect, type ReactNode } from 'react';
import { CloseIcon } from '../icons';

interface Props {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Panel width. `panel` is the 661px Settings drawer from the design. */
  width?: 'dialog' | 'panel';
  label: string;
  /** Settings is dismissible by backdrop; the pause charge should be a deliberate choice. */
  dismissible?: boolean;
}

export default function Modal({
  open,
  onClose,
  children,
  width = 'dialog',
  label,
  dismissible = true,
}: Props) {
  useEffect(() => {
    if (!open || !dismissible) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, dismissible, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div
        className="animate-fade-in absolute inset-0 bg-ink/25 backdrop-blur-sm"
        onClick={dismissible ? onClose : undefined}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={`animate-pop-in shadow-pop relative flex max-h-full flex-col overflow-hidden rounded-card bg-surface ring-1 ring-hairline ${
          width === 'panel' ? 'w-[661px]' : 'w-[420px]'
        }`}
      >
        {dismissible && (
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 z-10 grid size-9 place-items-center rounded-full text-ink-faint transition-colors hover:bg-surface-sunk hover:text-ink"
          >
            <CloseIcon className="size-5" />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
