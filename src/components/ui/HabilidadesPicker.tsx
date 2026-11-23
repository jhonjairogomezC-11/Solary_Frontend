import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'

import { MAX_HABILIDADES, MIN_HABILIDADES, type HabilidadCat } from '@/types/alineacion'

interface Props {
  catalogo: HabilidadCat[]
  value: number[]
  onChange: (ids: number[]) => void
}

/** Selector de habilidades agrupado por categoría, con búsqueda y límites 3–10. */
export function HabilidadesPicker({ catalogo, value, onChange }: Props) {
  const [q, setQ] = useState('')

  const grupos = useMemo(() => {
    const term = q.trim().toLowerCase()
    const map = new Map<string, HabilidadCat[]>()
    for (const h of catalogo) {
      if (term && !h.nombre.toLowerCase().includes(term)) continue
      const cat = h.categoria ?? 'Otras'
      map.set(cat, [...(map.get(cat) ?? []), h])
    }
    return [...map.entries()]
  }, [catalogo, q])

  const toggle = (id: number) => {
    if (value.includes(id)) onChange(value.filter((v) => v !== id))
    else if (value.length < MAX_HABILIDADES) onChange([...value, id])
  }

  const ok = value.length >= MIN_HABILIDADES && value.length <= MAX_HABILIDADES

  return (
    <div>
      <div className="relative">
        <Search className="absolute left-3 top-2.5 size-4 text-ink-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar habilidad…"
          className="w-full rounded-xl border border-ink-200 bg-white py-2 pl-9 pr-3 text-sm dark:border-ink-700 dark:bg-ink-900"
        />
      </div>
      <p className={`mt-2 text-xs ${ok ? 'text-green-600' : 'text-amber-600'}`}>
        {value.length} de {MAX_HABILIDADES} seleccionadas (mínimo {MIN_HABILIDADES})
      </p>
      <div className="mt-2 max-h-72 space-y-3 overflow-y-auto pr-1">
        {grupos.map(([cat, items]) => (
          <div key={cat}>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-500">{cat}</p>
            <div className="flex flex-wrap gap-1.5">
              {items.map((h) => {
                const activa = value.includes(h.id)
                return (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => toggle(h.id)}
                    className={`rounded-full border px-3 py-1 text-xs transition ${
                      activa
                        ? 'border-solar-500 bg-solar-500 text-white'
                        : 'border-ink-200 bg-white text-ink-700 hover:border-solar-400 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-200'
                    }`}
                  >
                    {h.nombre}
                    {h.es_profesional && <span title="Requiere formación profesional"> ◆</span>}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
