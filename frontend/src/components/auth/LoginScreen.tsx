import Skyline from '../city/Skyline';
import Button from '../ui/Button';

interface Props {
  onEnter: () => void;
}

/**
 * Deliberately not a login form.
 *
 * The backend has no auth endpoint and no user store yet, so any password field
 * here would accept anything — a gate that always opens is worse than no gate,
 * because it implies your progress is protected when it isn't. When real auth
 * lands (plus the MFA the wiki calls for), this becomes email + password and the
 * copy below goes away.
 */
export default function LoginScreen({ onEnter }: Props) {
  return (
    <div className="relative flex h-full items-center justify-center overflow-hidden">
      <Skyline />

      <div className="shadow-lift relative z-10 w-[440px] rounded-card bg-surface/95 p-10 text-center ring-1 ring-hairline backdrop-blur-md">
        <h1 className="font-display text-5xl font-bold tracking-[0.08em] text-ink uppercase">
          Pomo
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          Focus, earn coins, build your city.
        </p>

        <Button
          variant="primary"
          size="lg"
          className="mt-8 w-full"
          onClick={onEnter}
          autoFocus
        >
          Enter Pomo
        </Button>

        <p className="mt-5 text-xs leading-relaxed text-ink-faint">
          Accounts aren't built yet. Your city and coins save to{' '}
          <strong className="text-ink-soft">this browser only</strong> — they
          won't follow you to another device, and clearing site data wipes them.
        </p>
      </div>
    </div>
  );
}
