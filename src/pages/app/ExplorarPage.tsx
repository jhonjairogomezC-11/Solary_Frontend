import { useEffect, useMemo, useState } from 'react'
import { Loader2, Search, SlidersHorizontal } from 'lucide-react'

import { ConvocatoriaCard } from '@/components/convocatorias/ConvocatoriaCard'
import { Alert } from '@/components/ui/Alert'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { parseApiError } from '@/lib/apiClient'
import { convocatoriaService, type ConvocatoriaFiltros } from '@/services/convocatoriaService'
import type { AreaImpacto, Convocatoria, Municipio } from '@/types/convocatoria'

const MODALIDAD_OPTS = [
  { value: '', label: 'Todas las modalidades' },
  { value: 'PRESENCIAL', label: 'Presencial' },
  { value: 'VIRTUAL', label: 'Virtual' },
  { value: 'HIBRIDA', label: 'Híbrida' },
]

export function ExplorarPage() {
  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([])
  const [areas, setAreas] = useState<AreaImpacto[]>([])
  const [municipios, setMunicipios] = useState<Municipio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)

  const [buscar, setBuscar] = useState('')
  const [categoria, setCategoria] = useState('')
  const [modalidad, setModalidad] = useState('')
  const [municipio, setMunicipio] = useState('')

  useEffect(() => {
    Promise.all([convocatoriaService.areasImpacto(), convocatoriaService.municipios()])
      .then(([a, m]) => {
        setAreas(a)
        setMunicipios(m)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const handler = setTimeout(() => {
      setLoading(true)
      setError(null)
      const filtros: ConvocatoriaFiltros = { page: 1, per_page: 24 }
      if (buscar) filtros.buscar = buscar
      if (categoria) filtros.categoria_id = Number(categoria)
      if (modalidad) filtros.modalidad = modalidad
      if (municipio) filtros.municipio_id = Number(municipio)

      convocatoriaService
        .listar(filtros)
        .then((res) => {
          setConvocatorias(res.data)
          setTotal(res.total)
        })
        .catch((err) => setError(parseApiError(err).message))
        .finally(() => setLoading(false))
    }, 350)
    return () => clearTimeout(handler)
  }, [buscar, categoria, modalidad, municipio])

  const areaOpts = useMemo(
    () => [{ value: '', label: 'Todas las categorías' }, ...areas.map((a) => ({ value: a.id, label: a.nombre }))],
    [areas],
  )
  const muniOpts = useMemo(
    () => [{ value: '', label: 'Todos los municipios' }, ...municipios.map((m) => ({ value: m.id, label: m.nombre }))],
    [municipios],
  )

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink-900 dark:text-white">
          Explorar convocatorias
        </h1>
        <p className="mt-1 text-ink-500 dark:text-ink-400">
          Encuentra oportunidades de voluntariado que encajen contigo.
        </p>
      </div>

      {/* Filtros */}
      <div className="mb-6 rounded-2xl border border-ink-200/60 bg-white/70 p-4 backdrop-blur dark:border-ink-700/60 dark:bg-ink-900/50">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink-700 dark:text-ink-200">
          <SlidersHorizontal className="size-4 text-solar-500" /> Filtros
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            placeholder="Buscar..."
            icon={<Search className="size-4.5" />}
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
          />
          <Select options={areaOpts} value={categoria} onChange={(e) => setCategoria(e.target.value)} />
          <Select options={MODALIDAD_OPTS} value={modalidad} onChange={(e) => setModalidad(e.target.value)} />
          <Select options={muniOpts} value={municipio} onChange={(e) => setMunicipio(e.target.value)} />
        </div>
      </div>

      {error && <Alert tone="error" className="mb-4">{error}</Alert>}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="size-8 animate-spin text-solar-500" />
        </div>
      ) : convocatorias.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-300 py-20 text-center dark:border-ink-700">
          <p className="text-ink-500 dark:text-ink-400">
            No hay convocatorias que coincidan con tu búsqueda.
          </p>
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-ink-400">{total} convocatoria{total !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {convocatorias.map((c, i) => (
              <ConvocatoriaCard key={c.id} convocatoria={c} index={i} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
