import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { HabilidadesPicker } from '@/components/ui/HabilidadesPicker'
import { parseApiError } from '@/lib/apiClient'
import { habilidadService } from '@/services/alineacionService'
import { MAX_HABILIDADES, MIN_HABILIDADES, type HabilidadCat } from '@/types/alineacion'

export function HabilidadesPage() {
  const [catalogo, setCatalogo] = useState<HabilidadCat[]>([])
  const [sel, setSel] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ tone: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    let active = true
    Promise.all([habilidadService.catalogo(), habilidadService.mias()])
      .then(([c, m]) => {
        if (!active) return
        setCatalogo(c)
        setSel(m)
      })
      .catch((e) => active && setMsg({ tone: 'error', text: parseApiError(e).message }))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const guardar = async () => {
    setSaving(true)
    setMsg(null)
    try {
      setSel(await habilidadService.guardarMias(sel))
      setMsg({ tone: 'success', text: 'Habilidades guardadas. Se usarán para calcular tu compatibilidad.' })
    } catch (e) {
      setMsg({ tone: 'error', text: parseApiError(e).message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink-900 dark:text-white">
        Mis habilidades
      </h1>
      <p className="mt-1 text-ink-500 dark:text-ink-400">
        Elige entre {MIN_HABILIDADES} y {MAX_HABILIDADES}. Ordenan las convocatorias por
        compatibilidad, pero nunca te impiden postularte.
      </p>
      {msg && <Alert tone={msg.tone} className="mt-4">{msg.text}</Alert>}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="size-8 animate-spin text-solar-500" />
        </div>
      ) : (
        <div className="mt-6">
          <HabilidadesPicker catalogo={catalogo} value={sel} onChange={setSel} />
          <Button
            className="mt-4"
            loading={saving}
            disabled={sel.length < MIN_HABILIDADES}
            onClick={guardar}
          >
            Guardar habilidades
          </Button>
        </div>
      )}
    </div>
  )
}
