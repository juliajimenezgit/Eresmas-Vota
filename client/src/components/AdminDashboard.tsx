import { type FormEvent, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { ThemeToggleButton } from './ThemeToggleButton'
import { fetchAdminDashboard, resetAdminVotes, type AdminDashboardData } from '../lib/api'
import { useThemeMode } from '../lib/theme'

const ADMIN_KEY_STORAGE = 'eresmas_admin_key'

function formatDate(value: string | null): string {
  if (!value) return '-'
  const hasTimezone = /[zZ]|[+-]\d{2}:\d{2}$/.test(value)
  if (hasTimezone) {
    return new Date(value).toLocaleString('es-ES')
  }

  // Parse naive timestamps as UTC explicitly (cross-browser safe).
  // Accepts "YYYY-MM-DD HH:mm:ss(.sss)" and "YYYY-MM-DDTHH:mm:ss(.sss)".
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,6}))?$/,
  )
  if (!match) {
    return new Date(value).toLocaleString('es-ES')
  }

  const [, y, m, d, hh, mm, ss, fraction = '0'] = match
  const ms = Number((fraction + '000').slice(0, 3))
  const utcDate = new Date(
    Date.UTC(Number(y), Number(m) - 1, Number(d), Number(hh), Number(mm), Number(ss), ms),
  )
  return utcDate.toLocaleString('es-ES')
}

export function AdminDashboard() {
  const { theme, toggleTheme } = useThemeMode()
  const [adminKey, setAdminKey] = useState(() => localStorage.getItem(ADMIN_KEY_STORAGE) ?? '')
  const [inputKey, setInputKey] = useState('')
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null)
  const [loading, setLoading] = useState(false)
  const [resettingVotes, setResettingVotes] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const authenticated = Boolean(adminKey)

  const loadData = async (key: string, options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false
    if (!silent) {
      setLoading(true)
      setError(null)
    }
    try {
      const data = await fetchAdminDashboard(key)
      setDashboard((previous) => {
        if (!previous) return data
        return JSON.stringify(previous) === JSON.stringify(data) ? previous : data
      })
      if (!silent) {
        setError(null)
      }
    } catch (err) {
      if (silent) {
        // Keep panel stable on transient polling errors.
        return
      }
      const isUnauthorized = axios.isAxiosError(err) && err.response?.status === 401
      setDashboard(null)
      setError(
        isUnauthorized
          ? 'Contraseña incorrecta. Inténtalo de nuevo.'
          : 'No se pudo conectar con el servidor. Inténtalo de nuevo.',
      )
      localStorage.removeItem(ADMIN_KEY_STORAGE)
      setAdminKey('')
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    if (!authenticated) return
    void loadData(adminKey)
    const interval = window.setInterval(() => {
      void loadData(adminKey, { silent: true })
    }, 5000)
    return () => window.clearInterval(interval)
  }, [authenticated, adminKey])

  const topVoteCount = useMemo(() => {
    if (!dashboard?.votes_by_charanga.length) return 1
    return Math.max(...dashboard.votes_by_charanga.map((item) => item.votes), 1)
  }, [dashboard])

  const onLogin = async (event: FormEvent) => {
    event.preventDefault()
    const key = inputKey.trim()
    if (!key) return
    setError(null)
    localStorage.setItem(ADMIN_KEY_STORAGE, key)
    setAdminKey(key)
    setInputKey('')
  }

  const onLogout = () => {
    localStorage.removeItem(ADMIN_KEY_STORAGE)
    setAdminKey('')
    setDashboard(null)
    setError(null)
  }

  const onConfirmResetVotes = async () => {
    if (resettingVotes) return
    setResettingVotes(true)
    try {
      await resetAdminVotes(adminKey)
      setShowResetConfirm(false)
      await loadData(adminKey, { silent: true })
    } catch (err) {
      const isUnauthorized = axios.isAxiosError(err) && err.response?.status === 401
      setError(
        isUnauthorized
          ? 'No autorizado para reiniciar votos. Inicia sesión de nuevo.'
          : 'No se pudieron reiniciar los votos. Inténtalo de nuevo.',
      )
    } finally {
      setResettingVotes(false)
    }
  }

  if (!authenticated) {
    return (
      <div className="theme-aware min-h-screen bg-slate-950 px-4 py-10 text-white">
        <div className="mx-auto mb-4 flex max-w-7xl justify-start">
          <ThemeToggleButton theme={theme} onToggle={toggleTheme} />
        </div>
        <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-white/5 p-6">
          <h1 className="text-2xl font-black">Panel de Organizadores</h1>
          <p className="mt-2 text-sm text-white/70">
            Accede con tu clave para ver los votos en directo y determinar la charanga ganadora.
          </p>
          <form onSubmit={onLogin} className="mt-5 space-y-3">
            <input
              type="password"
              value={inputKey}
              onChange={(event) => setInputKey(event.target.value)}
              placeholder="Introduce la clave de organizador"
              className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-white/40 focus:border-fuchsia-400"
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-fuchsia-500 to-sky-500 px-4 py-3 text-sm font-bold"
            >
              Entrar al panel
            </button>
          </form>
          {error && (
            <p className="mt-3 rounded-lg border border-rose-400/30 bg-rose-500/15 px-3 py-2 text-sm text-rose-100">
              {error}
            </p>
          )}
          <p className="mt-4 text-xs text-white/50">URL de uso interno para organización.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="theme-aware subtle-scroll min-h-screen overflow-y-scroll bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex justify-start">
          <ThemeToggleButton theme={theme} onToggle={toggleTheme} />
        </div>
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-fuchsia-300/80">Organización</p>
            <h1 className="text-2xl font-black">Panel de votos en directo</h1>
          </div>
          <div className="flex w-full flex-col items-end gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="order-2 rounded-lg border border-amber-400/40 px-3 py-2 text-sm text-amber-100 hover:bg-amber-500/20 sm:order-2"
            >
              Reiniciar votos
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="order-3 rounded-lg border border-rose-400/40 px-3 py-2 text-sm text-rose-200 hover:bg-rose-500/20 sm:order-3"
            >
              Cerrar sesión
            </button>
            <div className="order-1 inline-flex min-w-28 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/60 sm:order-1">
              <span className="relative inline-flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400/45" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
              </span>
              {loading && !dashboard ? 'Cargando…' : 'En directo'}
            </div>
            <p className="order-4 mt-1 text-right text-xs text-white/50 sm:basis-full sm:order-4">
              Actualización automática cada 5 segundos
            </p>
          </div>
        </header>
        {error && <p className="rounded-xl bg-rose-500/20 px-4 py-3 text-sm text-rose-100">{error}</p>}

        {dashboard && (
          <>
            <section className="grid gap-4 md:grid-cols-4">
              <StatCard label="Votos totales" value={dashboard.total_votes.toString()} />
              <StatCard label="Dispositivos únicos" value={dashboard.unique_devices.toString()} />
              <StatCard label="IPs únicas" value={dashboard.unique_ips.toString()} />
              <StatCard label="Último voto" value={formatDate(dashboard.last_vote_at)} />
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-xl font-bold">Estado de ganador</h2>
              <div className="mt-2 min-h-11">
                {!dashboard.leader_charanga && <p className="text-sm text-white/60">Aún no hay votos.</p>}
                {dashboard.leader_charanga && (
                  <p className="text-sm text-white/85">
                    {dashboard.has_tie
                      ? `Empate en cabeza con ${dashboard.leader_votes} votos.`
                      : `Líder actual: ${dashboard.leader_charanga} con ${dashboard.leader_votes} votos.`}
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="mb-3 text-xl font-bold">Ranking por charanga</h2>
              <div className="subtle-scroll max-h-64 overflow-y-auto pr-1" style={{ scrollbarGutter: 'stable' }}>
                <ul className="space-y-3">
                  {dashboard.votes_by_charanga.map((item) => (
                    <li key={item.charanga}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span>{item.charanga}</span>
                        <span className="font-semibold">{item.votes}</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-lime-400 via-fuchsia-500 to-sky-500"
                          style={{ width: `${(item.votes / topVoteCount) * 100}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="mb-3 text-xl font-bold">Últimos votos</h2>
              <div
                className="subtle-scroll h-80 overflow-y-scroll overflow-x-auto"
                style={{ scrollbarGutter: 'stable' }}
              >
                <table className="min-w-full text-left text-sm">
                  <thead className="text-white/60">
                    <tr>
                      <th className="px-3 py-2">Fecha</th>
                      <th className="px-3 py-2">Charanga</th>
                      <th className="px-3 py-2">IP</th>
                      <th className="px-3 py-2">User-Agent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.recent_votes.map((vote) => (
                      <tr key={vote.id} className="border-t border-white/10">
                        <td className="px-3 py-2">{formatDate(vote.created_at)}</td>
                        <td className="px-3 py-2">{vote.charanga}</td>
                        <td className="px-3 py-2">{vote.ip ?? '-'}</td>
                        <td className="max-w-[400px] truncate px-3 py-2 text-white/70">
                          {vote.user_agent ?? '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/15 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white">Confirmar reinicio de votos</h3>
            <p className="mt-3 text-sm text-white/75">
              Si pulsas confirmar, se borrarán todos los votos registrados hasta ahora. ¿Quieres
              confirmar o prefieres cancelar?
            </p>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                disabled={resettingVotes}
                className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/85 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void onConfirmResetVotes()}
                disabled={resettingVotes}
                className="rounded-lg border border-rose-400/40 bg-rose-500/20 px-4 py-2 text-sm font-semibold text-rose-100 hover:bg-rose-500/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {resettingVotes ? 'Reiniciando…' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.15em] text-white/55">{label}</p>
      <p className="mt-2 truncate whitespace-nowrap text-2xl font-extrabold">{value}</p>
    </article>
  )
}
