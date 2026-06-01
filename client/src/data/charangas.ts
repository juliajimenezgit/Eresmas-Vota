export interface CharangaOption {
  name: string
  logo?: string
  accent: string
}

export const CHARANGAS: CharangaOption[] = [
  {
    name: 'Charanga Alianza',
    logo: '/charanga-alianza.png',
    accent: 'from-orange-500/35 to-amber-500/20',
  },
  {
    name: 'Charanga El Boquerón',
    logo: '/charanga-el-boqueron.png',
    accent: 'from-rose-300/35 to-pink-400/20',
  },
  {
    name: 'Charanga Sioké',
    logo: '/charanga-sioke.png',
    accent: 'from-sky-500/30 to-indigo-600/20',
  },
  {
    name: "Charanga Sin Copa",
    logo: '/charanga-sin-copa.png',
    accent: 'from-blue-500/30 to-cyan-400/20',
  },
]
