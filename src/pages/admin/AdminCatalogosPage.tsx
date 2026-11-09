import { useEffect, useState } from 'react'
import { Plus, Tag } from 'lucide-react'

import { adminService } from '@/services/adminService'
import { convocatoriaService } from '@/services/convocatoriaService'
import type { AreaImpacto, Departamento, Habilidad, Municipio } from '@/types/convocatoria'

export function AdminCatalogosPage() {
  const [areas, setAreas] = useState<AreaImpacto[]>([])
  const [habilidades, setHabilidades] = useState<Habilidad[]>([])
  const [departamentos, setDepartamentos] = useState<Departamento[]>([])
  const [municipios, setMunicipios] = useState<Municipio[]>([])
  const [msg, setMsg] = useState<string | null>(null)

  const cargar = async () => {
    const [a, h, d, m] = await Promise.all([
      convocatoriaService.areasImpacto(),
      convocatoriaService.habilidades(),
      convocatoriaService.departamentos(),
      convocatoriaService.municipios(),
    ])
    setAreas(a)
    setHabilidades(h)
    setDepartamentos(d)
    setMunicipios(m)
  }

  useEffect(() => {
    const t = setTimeout(() => void cargar(), 0)
    return () => clearTimeout(t)
  }, [])

  const flash = (t: string) => {
    setMsg(t)
    setTimeout(() => setMsg(null), 2500)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900 dark:text-white">Catálogos</h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
          Administra las categorías, habilidades y ubicaciones del sistema.
        </p>
      </div>

      {msg && (
        <div className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
          {msg}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <CatalogoSimple
          titulo="Áreas de impacto"
          items={areas}
          onCrear={async (nombre) => {
            await adminService.crearArea(nombre)
            await cargar()
            flash('Área creada.')
          }}
        />
        <CatalogoSimple
          titulo="Habilidades"
          items={habilidades}
          onCrear={async (nombre) => {
            await adminService.crearHabilidad(nombre)
            await cargar()
            flash('Habilidad creada.')
          }}
        />
        <CatalogoSimple
          titulo="Departamentos"
          items={departamentos}
          onCrear={async (nombre) => {
            await adminService.crearDepartamento(nombre)
            await cargar()
            flash('Departamento creado.')
          }}
        />
        <CatalogoMunicipios
          municipios={municipios}
          departamentos={departamentos}
          onCrear={async (nombre, depId) => {
            await adminService.crearMunicipio(nombre, depId)
            await cargar()
            flash('Municipio creado.')
          }}
        />
      </div>
    </div>
  )
}

function CatalogoSimple({
  titulo,
  items,
  onCrear,
}: {
  titulo: string
  items: { id: number; nombre: string }[]
  onCrear: (nombre: string) => Promise<void>
}) {
  const [nombre, setNombre] = useState('')
  const [saving, setSaving] = useState(false)

  const crear = async () => {
    if (nombre.trim().length < 2) return
    setSaving(true)
    try {
      await onCrear(nombre.trim())
      setNombre('')
    } catch {
      window.alert('No se pudo crear (¿ya existe?).')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-2xl border border-ink-200/60 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
      <h3 className="mb-3 text-sm font-semibold text-ink-900 dark:text-white">{titulo}</h3>
      <div className="mb-3 flex gap-2">
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && crear()}
          placeholder="Nuevo nombre…"
          className="flex-1 rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm dark:border-ink-700 dark:bg-ink-950"
        />
        <button
          onClick={crear}
          disabled={saving}
          className="flex items-center gap-1.5 rounded-xl bg-solar-500 px-3 py-2 text-sm font-semibold text-white hover:bg-solar-600 disabled:opacity-40"
        >
          <Plus className="size-4" />
        </button>
      </div>
      <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto">
        {items.map((it) => (
          <span
            key={it.id}
            className="inline-flex items-center gap-1.5 rounded-full bg-ink-100 px-3 py-1 text-xs text-ink-600 dark:bg-ink-800 dark:text-ink-300"
          >
            <Tag className="size-3" /> {it.nombre}
          </span>
        ))}
      </div>
    </div>
  )
}

function CatalogoMunicipios({
  municipios,
  departamentos,
  onCrear,
}: {
  municipios: Municipio[]
  departamentos: Departamento[]
  onCrear: (nombre: string, depId: number) => Promise<void>
}) {
  const [nombre, setNombre] = useState('')
  const [depId, setDepId] = useState<number | ''>('')
  const [saving, setSaving] = useState(false)

  const crear = async () => {
    if (nombre.trim().length < 2 || !depId) return
    setSaving(true)
    try {
      await onCrear(nombre.trim(), Number(depId))
      setNombre('')
    } catch {
      window.alert('No se pudo crear el municipio.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-2xl border border-ink-200/60 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
      <h3 className="mb-3 text-sm font-semibold text-ink-900 dark:text-white">Municipios</h3>
      <div className="mb-3 space-y-2">
        <select
          value={depId}
          onChange={(e) => setDepId(e.target.value ? Number(e.target.value) : '')}
          className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm dark:border-ink-700 dark:bg-ink-950"
        >
          <option value="">Selecciona departamento…</option>
          {departamentos.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nombre}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && crear()}
            placeholder="Nombre del municipio…"
            className="flex-1 rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm dark:border-ink-700 dark:bg-ink-950"
          />
          <button
            onClick={crear}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-xl bg-solar-500 px-3 py-2 text-sm font-semibold text-white hover:bg-solar-600 disabled:opacity-40"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>
      <p className="text-xs text-ink-400">{municipios.length} municipios registrados</p>
    </div>
  )
}
