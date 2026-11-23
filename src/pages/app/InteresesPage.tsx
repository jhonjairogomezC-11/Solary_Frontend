import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Loader2, Sparkles } from 'lucide-react'

import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { parseApiError } from '@/lib/apiClient'
import { cn } from '@/lib/utils'
import { voluntarioService } from '@/services/voluntarioService'
import type { Interes } from '@/types/voluntario'

const OBJETIVO = 10

/** Emoji representativo por nombre de interés (coincidencia parcial). */
function iconoPara(nombre: string): string {
  const n = nombre.toLowerCase()
  const mapa: [string, string][] = [
    ['animal', '🐾'], ['ambiente', '🌱'], ['reforest', '🌳'], ['educa', '📚'],
    ['alfabet', '✏️'], ['infancia', '🧒'], ['mayor', '👵'], ['salud', '🩺'],
    ['inclusión', '🤝'], ['vulnerable', '💗'], ['aliment', '🍲'], ['derechos', '⚖️'],
    ['cultura', '🎨'], ['arte', '🎭'], ['deporte', '⚽'], ['recrea', '🎉'],
    ['tecnolog', '💻'], ['innovac', '💡'], ['ciencia', '🔬'], ['comunitar', '🏘️'],
    ['vivienda', '🏠'], ['emergencia', '🚨'], ['riesgo', '⛑️'], ['limpieza', '🧹'],
    ['hídric', '💧'], ['agua', '💧'], ['agricult', '🌾'], ['psicológ', '🧠'],
    ['idioma', '🗣️'], ['turismo', '🧭'], ['emprend', '🚀'], ['movilidad', '♿'],
    ['social', '🫂'], ['comunitario', '🏘️'],
  ]
  for (const [clave, emoji] of mapa) {
    if (n.includes(clave)) return emoji
  }
  return '✨'
}

export function InteresesPage() {
  const navigate = useNavigate()
  const [catalogo, setCatalogo] = useState<Interes[]>([])
  const [seleccion, setSeleccion] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    Promise.all([voluntarioService.catalogoIntereses(), voluntarioService.misIntereses()])
      .then(([cat, mios]) => {
        if (!active) return
        setCatalogo(cat)
        setSeleccion(new Set(mios))
      })
      .catch((err) => active && setError(parseApiError(err).message))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const toggle = (id: number) => {
    setOk(null)
    setSeleccion((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        if (next.size >= 15) return prev // tope de seguridad
        next.add(id)
      }
      return next
    })
  }

  const cantidad = seleccion.size
  const suficiente = cantidad >= 1
  const progreso = useMemo(() => Math.min(100, (cantidad / OBJETIVO) * 100), [cantidad])

  const guardar = async () => {
    setError(null)
    setOk(null)
    setSaving(true)
    try {
      await voluntarioService.guardarIntereses([...seleccion])
      setOk('Tus intereses se guardaron. Verás convocatorias más afines a ti.')
    } catch (err) {
      setError(parseApiError(err).message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="size-8 animate-spin text-solar-500" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-solar-400 to-solar-600 text-white shadow-glow">
          <Sparkles className="size-6" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-900 dark:text-white">
            Tus intereses
          </h1>
          <p className="text-sm text-ink-500 dark:text-ink-400">
            Elige al menos {OBJETIVO}. Personalizaremos las convocatorias que te mostramos.
          </p>
        </div>
      </div>

      {/* Barra de progreso de selección */}
      <div className="sticky top-16 z-20 mb-5 rounded-2xl border border-ink-200/60 bg-white/80 p-4 backdrop-blur dark:border-ink-700/60 dark:bg-ink-900/70">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-ink-700 dark:text-ink-200">
            {cantidad} seleccionado{cantidad !== 1 ? 's' : ''}
            {cantidad < OBJETIVO && ` · faltan ${OBJETIVO - cantidad} para el ideal`}
          </span>
          <Button size="sm" onClick={guardar} loading={saving} disabled={!suficiente}>
            Guardar
          </Button>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-solar-400 to-solar-600 transition-all"
            style={{ width: `${progreso}%` }}
          />
        </div>
      </div>

      {error && <Alert tone="error" className="mb-4">{error}</Alert>}
      {ok && <Alert tone="success" className="mb-4">{ok}</Alert>}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {catalogo.map((it) => {
          const activo = seleccion.has(it.id)
          return (
            <button
              key={it.id}
              type="button"
              onClick={() => toggle(it.id)}
              aria-pressed={activo}
              className={cn(
                'group relative flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition',
                activo
                  ? 'border-solar-400 bg-solar-50 shadow-glow dark:border-solar-500/60 dark:bg-solar-500/10'
                  : 'border-ink-200/60 bg-white/70 hover:border-solar-300 hover:bg-solar-50/50 dark:border-ink-700/60 dark:bg-ink-900/50 dark:hover:border-solar-500/40',
              )}
            >
              {activo && (
                <span className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-solar-500 text-white">
                  <Check className="size-3.5" />
                </span>
              )}
              <span className="text-3xl">{iconoPara(it.nombre)}</span>
              <span
                className={cn(
                  'text-sm font-medium leading-tight',
                  activo ? 'text-solar-700 dark:text-solar-300' : 'text-ink-700 dark:text-ink-200',
                )}
              >
                {it.nombre}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate('/app')}>
          Volver al panel
        </Button>
        <Button onClick={guardar} loading={saving} disabled={!suficiente}>
          Guardar intereses
        </Button>
      </div>
    </div>
  )
}
