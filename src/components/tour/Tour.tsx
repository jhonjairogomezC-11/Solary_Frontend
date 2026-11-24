import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, X } from 'lucide-react'

import { useAuth } from '@/auth/AuthContext'
import { cn } from '@/lib/utils'

import { TourContext } from './tourContext'
import { pasosFundacion, pasosVoluntario, type TourStep } from './tourSteps'

const CLAVE = (usuarioId: string) => `solari.tour.v1.${usuarioId}`
const ANCHO = 340
const MARGEN = 16
const RELLENO = 6

/** Rectángulo visible del elemento del paso, o null si no existe o está oculto (móvil). */
function medir(target?: string): DOMRect | null {
  if (!target) return null
  const el = document.querySelector<HTMLElement>(`[data-tour="${CSS.escape(target)}"]`)
  if (!el) return null
  const r = el.getBoundingClientRect()
  return r.width > 0 && r.height > 0 ? r : null
}

export function TourProvider({ children }: { children: ReactNode }) {
  const { usuario } = useAuth()
  const [paso, setPaso] = useState<number | null>(null)

  const pasos = useMemo<TourStep[]>(() => {
    const nombre = usuario?.nombre.split(' ')[0] ?? ''
    if (usuario?.rol === 'FUNDACION') return pasosFundacion(nombre)
    if (usuario?.rol === 'VOLUNTARIO') return pasosVoluntario(nombre)
    return []
  }, [usuario?.nombre, usuario?.rol])

  const terminar = useCallback(() => {
    if (usuario) localStorage.setItem(CLAVE(usuario.id), 'visto')
    setPaso(null)
  }, [usuario])

  const iniciar = useCallback(() => {
    if (pasos.length) setPaso(0)
  }, [pasos.length])

  // Primera vez que el usuario entra: se lanza solo.
  useEffect(() => {
    if (!usuario || !pasos.length || localStorage.getItem(CLAVE(usuario.id))) return
    const t = setTimeout(() => setPaso(0), 700)
    return () => clearTimeout(t)
  }, [usuario, pasos.length])

  return (
    <TourContext.Provider value={{ iniciar }}>
      {children}
      {paso !== null &&
        createPortal(
          <TourOverlay
            pasos={pasos}
            indice={paso}
            onCambiar={setPaso}
            onTerminar={terminar}
          />,
          document.body,
        )}
    </TourContext.Provider>
  )
}

function TourOverlay({
  pasos,
  indice,
  onCambiar,
  onTerminar,
}: {
  pasos: TourStep[]
  indice: number
  onCambiar: (i: number) => void
  onTerminar: () => void
}) {
  const paso = pasos[indice]
  const ultimo = indice === pasos.length - 1
  const [rect, setRect] = useState<DOMRect | null>(null)
  const siguienteRef = useRef<HTMLButtonElement>(null)

  const anterior = useCallback(() => indice > 0 && onCambiar(indice - 1), [indice, onCambiar])
  const siguiente = useCallback(
    () => (ultimo ? onTerminar() : onCambiar(indice + 1)),
    [indice, ultimo, onCambiar, onTerminar],
  )

  // Ubica el elemento del paso y lo sigue si cambia el tamaño de la ventana o hay scroll.
  useLayoutEffect(() => {
    const el = paso.target
      ? document.querySelector<HTMLElement>(`[data-tour="${CSS.escape(paso.target)}"]`)
      : null
    el?.scrollIntoView({ block: 'nearest' })
    const actualizar = () => setRect(medir(paso.target))
    actualizar()
    window.addEventListener('resize', actualizar)
    window.addEventListener('scroll', actualizar, true)
    return () => {
      window.removeEventListener('resize', actualizar)
      window.removeEventListener('scroll', actualizar, true)
    }
  }, [paso.target])

  useEffect(() => {
    siguienteRef.current?.focus()
  }, [indice])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') siguiente()
      else if (e.key === 'ArrowLeft') anterior()
      else if (e.key === 'Escape') onTerminar()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [siguiente, anterior, onTerminar])

  // Posición de la tarjeta: a la derecha del elemento si cabe; si no, centrada.
  const alto = window.innerHeight
  const cabeALaDerecha = rect !== null && window.innerWidth - rect.right > ANCHO + MARGEN * 2
  const pos = rect && cabeALaDerecha
    ? {
        left: rect.right + MARGEN,
        top: Math.min(Math.max(rect.top + rect.height / 2 - 90, MARGEN), alto - 280),
      }
    : null
  const flechaTop = rect && pos ? rect.top + rect.height / 2 - pos.top - 7 : 0

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-labelledby="tour-titulo">
      {/* Fondo oscurecido con el "agujero" sobre el elemento del paso */}
      {rect ? (
        <motion.div
          className="pointer-events-none absolute rounded-xl ring-2 ring-solar-400"
          style={{ boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.62)' }}
          initial={false}
          animate={{
            left: rect.left - RELLENO,
            top: rect.top - RELLENO,
            width: rect.width + RELLENO * 2,
            height: rect.height + RELLENO * 2,
          }}
          transition={{ type: 'spring', stiffness: 260, damping: 30 }}
        />
      ) : (
        <div className="absolute inset-0 bg-ink-950/60" />
      )}

      {/* El div exterior posiciona; el interior anima (framer-motion pisa el transform). */}
      <div
        className={cn(
          'absolute',
          !pos && 'left-1/2 top-1/2 w-[min(92vw,380px)] -translate-x-1/2 -translate-y-1/2',
        )}
        style={pos ? { left: pos.left, top: pos.top, width: ANCHO } : undefined}
      >
        <motion.div
          key={indice}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="relative rounded-2xl border border-ink-200/60 bg-white p-5 shadow-2xl dark:border-ink-700 dark:bg-ink-900"
        >
          {pos && (
            <span
              className="absolute -left-[7px] size-3.5 rotate-45 border-b border-l border-ink-200/60 bg-white dark:border-ink-700 dark:bg-ink-900"
              style={{ top: flechaTop }}
            />
          )}

          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-semibold text-solar-600 dark:text-solar-400">
              Paso {indice + 1} de {pasos.length}
            </p>
            <button
              type="button"
              onClick={onTerminar}
              className="-mr-1 -mt-1 rounded-lg p-1 text-ink-400 transition hover:bg-ink-100 hover:text-ink-600 dark:hover:bg-ink-800"
              aria-label="Cerrar tutorial"
            >
              <X className="size-4" />
            </button>
          </div>
          <h2 id="tour-titulo" className="mt-1 font-display text-lg font-bold text-ink-900 dark:text-white">
            {paso.titulo}
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-600 dark:text-ink-300">{paso.texto}</p>

          {/* Puntos de progreso */}
          <div className="mt-4 flex flex-wrap gap-1">
            {pasos.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onCambiar(i)}
                aria-label={`Ir al paso ${i + 1}`}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  i === indice ? 'w-5 bg-solar-500' : 'w-1.5 bg-ink-200 hover:bg-ink-300 dark:bg-ink-700',
                )}
              />
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between gap-2">
            {ultimo ? (
              <span />
            ) : (
              <button
                type="button"
                onClick={onTerminar}
                className="text-xs font-medium text-ink-400 hover:text-ink-600 hover:underline"
              >
                Saltar tutorial
              </button>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={anterior}
                disabled={indice === 0}
                aria-label="Paso anterior"
                className="flex size-9 items-center justify-center rounded-xl border border-ink-200 text-ink-600 transition hover:bg-ink-50 disabled:opacity-40 dark:border-ink-700 dark:text-ink-300 dark:hover:bg-ink-800"
              >
                <ArrowLeft className="size-4" />
              </button>
              <button
                ref={siguienteRef}
                type="button"
                onClick={siguiente}
                className="flex h-9 items-center gap-1.5 rounded-xl bg-gradient-to-r from-solar-500 to-solar-600 px-4 text-sm font-semibold text-white shadow-glow transition hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-solar-400/70 focus:ring-offset-2 dark:focus:ring-offset-ink-900"
              >
                {ultimo ? 'Terminar' : indice === 0 ? 'Empezar' : 'Siguiente'}
                {!ultimo && <ArrowRight className="size-4" />}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
