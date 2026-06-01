import { Moon, Sun } from 'lucide-react'
import type { ThemeMode } from '../lib/theme'

interface Props {
  theme: ThemeMode
  onToggle: () => void
  className?: string
}

export function ThemeToggleButton({ theme, onToggle, className = '' }: Props) {
  const isDark = theme === 'dark'
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/85 shadow transition hover:bg-white/20 ${className}`}
    >
      {isDark ? <Sun size={18} strokeWidth={1.75} aria-hidden /> : <Moon size={18} strokeWidth={1.75} aria-hidden />}
    </button>
  )
}
