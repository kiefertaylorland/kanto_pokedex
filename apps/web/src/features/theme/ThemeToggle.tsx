import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemePreference } from './useThemePreference';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useThemePreference();
  const isDark = theme === 'dark';
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';
  const Icon = isDark ? Moon : Sun;
  return (
    <button
      type="button"
      aria-pressed={isDark}
      aria-label={label}
      title={label}
      onClick={toggle}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-sm border text-white transition-colors hover:bg-white/10',
        isDark ? 'border-white/70' : 'border-white/30 text-white/80',
        className,
      )}
    >
      <Icon className="h-[18px] w-[18px]" aria-hidden />
    </button>
  );
}
