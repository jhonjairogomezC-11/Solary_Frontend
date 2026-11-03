import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { parseApiError } from '@/lib/apiClient'
import { convocatoriaService } from '@/services/convocatoriaService'
import type { AreaImpacto, ConvocatoriaCreate, Habilidad, Municipio } from '@/types/convocatoria'

const MODALIDAD_OPTS = [
  { value: 'PRESENCIAL', label: 'Presencial' },
  { value: 'VIRTUAL', label: 'Virtual' },
  { value: 'HIBRIDA', label: 'Híbrida' },
]

export function CrearConvocatoriaPage() {
  const navigate = useNavigate()
  const [areas, setAreas] = useState<AreaImpacto[]>([])
  const [municipios, setMunicipios] = useState<Municipio[]>([])
  const [habilidades, setHabilidades] = useState<Habilidad[]>([])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    categoria_id: '',
    modalidad: 'PRESENCIAL',
    municipio_id: '',
    direccion_exacta: '',
    enlace_virtual: '',
    fecha_inicio: '',
    fecha_fin: '',
    hora_inicio: '',
    hora_fin: '',
    cupo_maximo: '1',
    requisitos_adicionales: '',
    contacto_nombre: '',
    contacto_email: '',
    contacto_telefono: '',
  })
  const [habsSel, setHabsSel] = useState<number[]>([])

  useEffect(() => {
    Promise.all([
      convocatoriaService.areasImpacto(),
      convocatoriaService.municipios(),
      convocatoriaService.habilidades(),
    ])
      .then(([a, m, h]) => {
        setAreas(a)
        setMunicipios(m)
        setHabilidades(h)
      })
      .catch(() => {})
  }, [])

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const toggleHab = (id: number) =>
    setHabsSel((sel) => (sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]))

  const requierePresencia = form.modalidad !== 'VIRTUAL'

  const submit = async (publicar: boolean) => {
    setError(null)
    setSaving(true)
    try {
      const payload: ConvocatoriaCreate = {
        titulo: form.titulo,
        descripcion: form.descripcion,
        categoria_id: Number(form.categoria_id),
        modalidad: form.modalidad as ConvocatoriaCreate['modalidad'],
        fecha_inicio: form.fecha_inicio,
        fecha_fin: form.fecha_fin,
        cupo_maximo: Number(form.cupo_maximo),
        habilidades: habsSel,
      }
      if (requierePresencia && form.municipio_id) payload.municipio_id = Number(form.municipio_id)
      if (form.direccion_exacta) payload.direccion_exacta = form.direccion_exacta
      if (form.enlace_virtual) payload.enlace_virtual = form.enlace_virtual
      if (form.hora_inicio) payload.hora_inicio = form.hora_inicio
      if (form.hora_fin) payload.hora_fin = form.hora_fin
      if (form.requisitos_adicionales) payload.requisitos_adicionales = form.requisitos_adicionales
      if (form.contacto_nombre) payload.contacto_nombre = form.contacto_nombre
      if (form.contacto_email) payload.contacto_email = form.contacto_email
      if (form.contacto_telefono) payload.contacto_telefono = form.contacto_telefono

      const creada = await convocatoriaService.crear(payload)
      if (publicar) {
        await convocatoriaService.publicar(creada.id)
      }
      navigate('/app/mis-convocatorias', { replace: true })
    } catch (err) {
      setError(parseApiError(err).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-solar-600 dark:text-ink-400"
      >
        <ArrowLeft className="size-4" /> Volver
      </button>

      <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink-900 dark:text-white">
        Nueva convocatoria
      </h1>
      <p className="mt-1 text-ink-500 dark:text-ink-400">
        Publica una oportunidad de voluntariado para tu fundación.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit(false)
        }}
        className="mt-6 space-y-5 rounded-2xl border border-ink-200/60 bg-white/70 p-6 backdrop-blur dark:border-ink-700/60 dark:bg-ink-900/50"
      >
        {error && <Alert tone="error">{error}</Alert>}

        <Input
          label="Título"
          placeholder="Jornada de reforestación"
          value={form.titulo}
          onChange={(e) => set('titulo', e.target.value)}
          required
        />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">
            Descripción
          </label>
          <textarea
            rows={4}
            value={form.descripcion}
            onChange={(e) => set('descripcion', e.target.value)}
            placeholder="Describe la actividad, qué harán los voluntarios y el impacto esperado."
            className="w-full rounded-xl border border-ink-200 bg-white/80 px-3.5 py-2.5 text-sm text-ink-900 shadow-sm transition placeholder:text-ink-400 focus:border-solar-400 focus:outline-none focus:ring-2 focus:ring-solar-400/70 dark:border-ink-700 dark:bg-ink-900/60 dark:text-white"
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Categoría"
            placeholder="Selecciona"
            options={areas.map((a) => ({ value: a.id, label: a.nombre }))}
            value={form.categoria_id}
            onChange={(e) => set('categoria_id', e.target.value)}
            required
          />
          <Select
            label="Modalidad"
            options={MODALIDAD_OPTS}
            value={form.modalidad}
            onChange={(e) => set('modalidad', e.target.value)}
          />
        </div>

        {requierePresencia && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Municipio"
              placeholder="Selecciona"
              options={municipios.map((m) => ({ value: m.id, label: m.nombre }))}
              value={form.municipio_id}
              onChange={(e) => set('municipio_id', e.target.value)}
            />
            <Input
              label="Dirección"
              placeholder="Calle 123 # 45-67"
              value={form.direccion_exacta}
              onChange={(e) => set('direccion_exacta', e.target.value)}
            />
          </div>
        )}

        {form.modalidad !== 'PRESENCIAL' && (
          <Input
            label="Enlace virtual"
            placeholder="https://meet.google.com/..."
            value={form.enlace_virtual}
            onChange={(e) => set('enlace_virtual', e.target.value)}
          />
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            label="Fecha inicio"
            type="date"
            value={form.fecha_inicio}
            onChange={(e) => set('fecha_inicio', e.target.value)}
            required
          />
          <Input
            label="Fecha fin"
            type="date"
            value={form.fecha_fin}
            onChange={(e) => set('fecha_fin', e.target.value)}
            required
          />
          <Input
            label="Cupos"
            type="number"
            min={1}
            value={form.cupo_maximo}
            onChange={(e) => set('cupo_maximo', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Hora inicio" type="time" value={form.hora_inicio} onChange={(e) => set('hora_inicio', e.target.value)} />
          <Input label="Hora fin" type="time" value={form.hora_fin} onChange={(e) => set('hora_fin', e.target.value)} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">
            Requisitos adicionales (opcional)
          </label>
          <textarea
            rows={2}
            value={form.requisitos_adicionales}
            onChange={(e) => set('requisitos_adicionales', e.target.value)}
            className="w-full rounded-xl border border-ink-200 bg-white/80 px-3.5 py-2.5 text-sm text-ink-900 shadow-sm transition focus:border-solar-400 focus:outline-none focus:ring-2 focus:ring-solar-400/70 dark:border-ink-700 dark:bg-ink-900/60 dark:text-white"
          />
        </div>

        {habilidades.length > 0 && (
          <div>
            <label className="mb-2 block text-sm font-medium text-ink-700 dark:text-ink-200">
              Habilidades deseadas
            </label>
            <div className="flex flex-wrap gap-2">
              {habilidades.map((h) => {
                const active = habsSel.includes(h.id)
                return (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => toggleHab(h.id)}
                    className={
                      active
                        ? 'rounded-full bg-gradient-to-r from-solar-500 to-solar-600 px-3 py-1 text-xs font-semibold text-white'
                        : 'rounded-full border border-ink-200 px-3 py-1 text-xs font-medium text-ink-600 hover:border-solar-300 dark:border-ink-700 dark:text-ink-300'
                    }
                  >
                    {h.nombre}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input label="Contacto" placeholder="Nombre" value={form.contacto_nombre} onChange={(e) => set('contacto_nombre', e.target.value)} />
          <Input label="Email contacto" type="email" value={form.contacto_email} onChange={(e) => set('contacto_email', e.target.value)} />
          <Input label="Teléfono contacto" value={form.contacto_telefono} onChange={(e) => set('contacto_telefono', e.target.value)} />
        </div>

        <div className="flex flex-col gap-3 border-t border-ink-200/60 pt-5 sm:flex-row dark:border-ink-700">
          <Button type="submit" variant="outline" size="lg" loading={saving} fullWidth>
            Guardar borrador
          </Button>
          <Button type="button" size="lg" loading={saving} fullWidth onClick={() => submit(true)}>
            Publicar ahora
          </Button>
        </div>
      </form>
    </div>
  )
}
