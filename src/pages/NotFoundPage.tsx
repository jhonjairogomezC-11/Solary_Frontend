import { Link } from 'react-router-dom'

import { AuroraBackground } from '@/components/ui/AuroraBackground'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'

export function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-solar-50 px-5 text-center dark:bg-ink-950">
      <AuroraBackground className="opacity-50" />
      <div className="relative z-10 flex flex-col items-center">
        <Logo size={44} />
        <p className="mt-10 font-display text-7xl font-extrabold text-solar-500">404</p>
        <h1 className="mt-3 font-display text-2xl font-bold text-ink-900 dark:text-white">
          Página no encontrada
        </h1>
        <p className="mt-2 max-w-sm text-ink-500 dark:text-ink-400">
          La página que buscas no existe o fue movida.
        </p>
        <Link to="/" className="mt-7">
          <Button size="lg">Volver al inicio</Button>
        </Link>
      </div>
    </div>
  )
}
