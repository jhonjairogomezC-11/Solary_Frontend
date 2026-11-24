import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, FileText, Loader2 } from 'lucide-react'

import { MarkdownLite } from '@/components/legal/MarkdownLite'
import { Alert } from '@/components/ui/Alert'
import { Logo } from '@/components/ui/Logo'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { api } from '@/lib/apiClient'
import { DOC_PRIVACIDAD, DOC_TERMINOS, slug, type DocumentoLegal } from '@/lib/legal'
import { cn, formatDate } from '@/lib/utils'

const PESTANAS = [
  { codigo: DOC_TERMINOS, ruta: '/terminos', label: 'Términos y condiciones' },
  { codigo: DOC_PRIVACIDAD, ruta: '/privacidad', label: 'Tratamiento de datos' },
]

/** Página pública que muestra la versión vigente de un documento legal. */
export function LegalPage({ codigo }: { codigo: string }) {
  const [docs, setDocs] = useState<DocumentoLegal[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    api
      .get<DocumentoLegal[]>('/legal/documentos')
      .then((r) => active && setDocs(r.data))
      .catch(() => active && setError('No pudimos cargar el documento. Intenta de nuevo más tarde.'))
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [codigo])

  const doc = docs?.find((d) => d.codigo === codigo)
  const indice = (doc?.contenido ?? '')
    .split('\n')
    .filter((l) => l.startsWith('## '))
    .map((l) => l.slice(3).trim())

  return (
    <div className="min-h-screen bg-solar-50 dark:bg-ink-950">
      <header className="sticky top-0 z-20 border-b border-ink-200/60 bg-white/80 backdrop-blur dark:border-ink-800 dark:bg-ink-950/70">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3">
          <Link to="/">
            <Logo />
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-8">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-solar-600 hover:underline">
          <ArrowLeft className="size-4" /> Volver al inicio
        </Link>

        <nav className="mt-5 flex gap-2 rounded-xl bg-ink-100 p-1 dark:bg-ink-800/60">
          {PESTANAS.map((p) => (
            <Link
              key={p.codigo}
              to={p.ruta}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
                p.codigo === codigo
                  ? 'bg-white text-ink-900 shadow-sm dark:bg-ink-900 dark:text-white'
                  : 'text-ink-500 hover:text-ink-700 dark:text-ink-400',
              )}
            >
              <FileText className="size-4" /> {p.label}
            </Link>
          ))}
        </nav>

        {error ? (
          <Alert tone="error" className="mt-6">{error}</Alert>
        ) : docs === null ? (
          <div className="flex justify-center py-24">
            <Loader2 className="size-8 animate-spin text-solar-500" />
          </div>
        ) : !doc?.contenido ? (
          <Alert tone="info" className="mt-6">
            Este documento todavía no está publicado.
          </Alert>
        ) : (
          <div className="mt-6 grid gap-8 lg:grid-cols-[220px_1fr]">
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-1 text-sm">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">Contenido</p>
                {indice.map((t) => (
                  <a
                    key={t}
                    href={`#${slug(t)}`}
                    className="block rounded-lg px-2 py-1 text-ink-500 transition hover:bg-white hover:text-solar-600 dark:text-ink-400 dark:hover:bg-ink-900"
                  >
                    {t}
                  </a>
                ))}
              </div>
            </aside>
            <article className="rounded-2xl border border-ink-200/60 bg-white/80 p-6 shadow-sm sm:p-10 dark:border-ink-700/60 dark:bg-ink-900/50">
              <p className="mb-4 text-xs text-ink-400">
                Versión {doc.version} · Publicada el {formatDate(doc.fecha_publicacion)}
              </p>
              <MarkdownLite source={doc.contenido} />
            </article>
          </div>
        )}
      </div>
    </div>
  )
}
