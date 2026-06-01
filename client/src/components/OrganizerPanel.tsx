export function OrganizerPanel() {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div className="mb-2 flex items-center gap-3">
        <img
          src="/charanga-eresmas.png"
          alt="Logo Charanga EresMas"
          className="h-12 w-12 rounded-xl border border-white/20 bg-white/10 object-cover shadow-lg"
        />
        <span className="text-white/50">|</span>
        <h2 className="text-xl font-bold">Charanga EresMas</h2>
      </div>
      <p className="mb-4 text-sm text-white/70">
        Contacto y redes sociales de la charanga organizadora.
      </p>
      <ul className="space-y-2 text-sm text-white/90">
        <li>
          <span className="text-white/60">Instagram:</span> @charangaeresmas
        </li>
        <li>
          <span className="text-white/60">Teléfono:</span> +34 661 365 213
        </li>
        <li>
          <span className="text-white/60">Email:</span> eresmascharanga@gmail.com
        </li>
      </ul>
    </section>
  )
}
