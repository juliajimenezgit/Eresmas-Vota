import { qrImageUrl } from '../lib/api'

export function QrPanel() {
  const src = qrImageUrl()
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur">
      <h2 className="mb-2 text-xl font-bold">Escanea para votar</h2>
      <p className="mb-4 text-sm text-white/60">Comparte este QR en el evento</p>
      <div className="inline-block rounded-xl bg-white p-3">
        <img src={src} alt="Código QR para votar" className="h-48 w-48" />
      </div>
    </section>
  )
}
