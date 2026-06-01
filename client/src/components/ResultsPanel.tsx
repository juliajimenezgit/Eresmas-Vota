import { useEffect, useState } from 'react'
import { fetchResults, type ResultItem } from '../lib/api'

interface Props {
  refreshKey: number
}

export function ResultsPanel({ refreshKey }: Props) {
  const [results, setResults] = useState<ResultItem[]>([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    let cancelled = false
  
    fetchResults()
      .then((data) => {
        if (!cancelled) {
          setResults(data)
          setError(null)
        }
      })
      .catch(() => {
        if (!cancelled) setError('No se pudieron cargar los resultados')
      })
      .finally(() => {
        if (!cancelled) setInitialLoading(false)
      })
  
    return () => {
      cancelled = true
    }
  }, [refreshKey])

  const totalVotes = results.reduce((sum, item) => sum + item.votes, 0)

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <h2 className="mb-4 text-xl font-bold">Resultados en vivo</h2>
      {initialLoading && results.length === 0 && (
        <p className="text-white/60"></p>
      )}
      {error && <p className="text-rose-400">{error}</p>}
      {!initialLoading && !error && results.length === 0 && (
        <p className="text-white/60">Aún no hay votos. ¡Sé el primero!</p>
      )}
      {!initialLoading && !error && totalVotes > 0 && (
        <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-4 text-center">
          <p className="text-3xl font-extrabold text-white">{totalVotes}</p>
          <p className="text-sm text-white/80">
            {totalVotes === 1 ? '1 persona ya ha votado' : `${totalVotes} personas ya han votado`}
          </p>
          <p className="text-sm text-fuchsia-200">Tu voto puede marcar la diferencia. ¡Anímate!</p>
        </div>
      )}

      {/* Si más adelante quieres volver a mostrar el detalle por charanga, descomenta este bloque.
      <ul className="space-y-3">
        {results.map((item) => (
          <li key={item.charanga}>
            <div className="mb-1 flex justify-between text-sm">
              <span>{item.charanga}</span>
              <span className="font-semibold">{item.votes}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-lime-400 via-fuchsia-400 to-sky-400 transition-all duration-500"
                style={{ width: `${(item.votes / maxVotes) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
      */}
    </section>
  )
}
