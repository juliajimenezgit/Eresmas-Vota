import type { CharangaOption } from '../data/charangas'

interface Props {
  charanga: CharangaOption
  selected: boolean
  disabled: boolean
  onSelect: () => void
}

export function CharangaCard({ charanga, selected, disabled, onSelect }: Props) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={[
        'group relative w-full overflow-hidden rounded-2xl border p-4 text-left transition',
        'bg-gradient-to-br',
        charanga.accent,
        selected
          ? 'border-white ring-2 ring-white/80'
          : 'border-white/15 hover:border-white/40',
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
      ].join(' ')}
    >
      <div className="flex items-center gap-4">
        {charanga.logo ? (
          <img
            src={charanga.logo}
            alt={charanga.name}
            className="h-16 w-16 shrink-0 rounded-xl object-cover shadow-lg"
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-white/10 text-2xl">
            🎺
          </div>
        )}
        <div>
          <p className="text-lg font-semibold text-white">{charanga.name}</p>
          {selected && <p className="text-sm text-white/80">Seleccionada</p>}
        </div>
      </div>
    </button>
  )
}
