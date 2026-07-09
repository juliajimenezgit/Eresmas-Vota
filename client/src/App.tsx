import { useCallback, useState } from 'react'
import { AdminDashboard } from './components/AdminDashboard'
import { CharangaCard } from './components/CharangaCard'
import { OrganizerPanel } from './components/OrganizerPanel'
import { ResultsPanel } from './components/ResultsPanel'
import { ThemeToggleButton } from './components/ThemeToggleButton'
import { CHARANGAS } from './data/charangas'
import { submitVote } from './lib/api'
import {
  getOrCreateDeviceId,
  hasVotedLocally,
  markVotedLocally,
} from './lib/deviceId'
import { useThemeMode } from './lib/theme'

function PublicVotingApp() {
  const { theme, toggleTheme } = useThemeMode()
  const [selected, setSelected] = useState<string | null>(null)
  const [alreadyVoted, setAlreadyVoted] = useState(hasVotedLocally())
  const [message, setMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [resultsKey, setResultsKey] = useState(0)

  const handleVote = useCallback(async () => {
    if (!selected || alreadyVoted || submitting) return

    setSubmitting(true)
    setMessage(null)
    try {
      const deviceId = getOrCreateDeviceId()
      const response = await submitVote(selected, deviceId)
      if (response.success) {
        markVotedLocally()
        setAlreadyVoted(true)
        setMessage('¡Gracias! Tu voto ha sido registrado.')
        setResultsKey((k) => k + 1)
      } else {
        setAlreadyVoted(true)
        setMessage(response.message ?? 'Ya has votado')
      }
    } catch {
      setMessage('Error al enviar el voto. Inténtalo de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }, [selected, alreadyVoted, submitting])

  return (
    <div className="theme-aware min-h-screen bg-[radial-gradient(ellipse_at_top,_#2a1a3a_0%,_#0f0f12_50%)]">
      <header className="relative border-b border-white/10 px-4 py-8 text-center">
        <div className="absolute right-4 top-4">
          <ThemeToggleButton theme={theme} onToggle={toggleTheme} />
        </div>
        <p className="text-sm uppercase tracking-[0.3em] text-fuchsia-300/80">QUINTANAR DEL REY</p>
        <div className="mt-4 flex justify-center">
          <img
            src="/champi_logo.png"
            alt="Mascota del concurso"
            className="h-32 w-32 object-contain md:h-36 md:w-36"
          />
        </div>
        <div className="mx-auto mt-4 max-w-4xl">
          <h1 className="text-3xl font-black tracking-tight text-white md:text-5xl">
            II CONCURSO NACIONAL DE CHARANGAS
          </h1>
        </div>
        <p className="mx-auto mt-3 max-w-xl text-white/60">
          Elige tu charanga favorita. Solo un voto por dispositivo. Los nombres de las charangas
          aparecen en orden de actuación.
        </p>
        <div className="mx-auto mt-5 max-w-3xl rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
          <p className="mb-3 text-xs uppercase tracking-[0.25em] text-white/65">Organizan</p>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            <img
              src="/eresmas_logo.png"
              alt="Logo EresMas"
              className="h-20 w-20 object-contain md:h-24 md:w-24"
            />
            <img
              src="/quintanar_logo.png"
              alt="Logo Quintanar"
              className="h-20 w-20 object-contain md:h-24 md:w-24"
            />
            <img
              src="/qtt_logo.png"
              alt="Logo QTT"
              className="h-20 w-20 object-contain md:h-24 md:w-24"
            />
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="space-y-3">
            {CHARANGAS.map((charanga) => (
              <CharangaCard
                key={charanga.name}
                charanga={charanga}
                selected={selected === charanga.name}
                disabled={alreadyVoted}
                onSelect={() => setSelected(charanga.name)}
              />
            ))}
          </section>

          {message && (
            <p
              className={`rounded-xl px-4 py-3 text-center text-sm ${
                message.includes('Gracias')
                  ? 'bg-lime-500/20 text-lime-200'
                  : 'bg-amber-500/20 text-amber-100'
              }`}
            >
              {message}
            </p>
          )}

          <button
            type="button"
            disabled={!selected || alreadyVoted || submitting}
            onClick={handleVote}
            className="w-full rounded-2xl bg-gradient-to-r from-lime-500 via-fuchsia-500 to-sky-500 px-6 py-4 text-lg font-bold text-white shadow-lg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {alreadyVoted ? 'Ya has votado' : submitting ? 'Enviando…' : 'Confirmar voto'}
          </button>
        </div>

        <aside className="space-y-6">
          <ResultsPanel refreshKey={resultsKey} />
          <OrganizerPanel />
        </aside>
      </main>
    </div>
  )
}

function App() {
  const isAdminRoute = window.location.pathname.startsWith('/admin')
  if (isAdminRoute) {
    return <AdminDashboard />
  }
  return <PublicVotingApp />
}

export default App
