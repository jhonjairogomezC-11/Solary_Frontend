import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ImagePlus, Loader2, X } from 'lucide-react'

import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { HabilidadesPicker } from '@/components/ui/HabilidadesPicker'
import { parseApiError } from '@/lib/apiClient'
import { habilidadService, programacionService } from '@/services/alineacionService'
import { convocatoriaService } from '@/services/convocatoriaService'
import {
  MAX_HABILIDADES,
  MIN_HABILIDADES,
  type HabilidadCat,
  type UnidadIntervalo,
} from '@/types/alineacion'
import type { AreaImpacto, Convocatoria, ConvocatoriaCreate, Municipio } from '@/types/convocatoria'

const MAX_CICLO = 3
const MAX_FOTOS = 8

const MODALIDAD_OPTS = [
  { value: 'PRESENCIAL', label: 'Presencial' },
  { value: 'VIRTUAL', label: 'Virtual' },
  { value: 'HIBRIDA', label: 'Híbrida' },
]

export function CrearConvocatoriaPage() {
  const navigate = useNavigate()
  const { id: editId } = useParams<{ id: string }>()
  const editando = Boolean(editId)
  const [original, setOriginal] = useState<Convocatoria | null>(null)
  const [cargando, setCargando] = useState(editando)
  const [fotosActuales, setFotosActuales] = useState<{ id: string; ruta: string }[]>([])
  const [areas, setAreas] = useState<AreaImpacto[]>([])
  const [municipios, setMunicipios] = useState<Municipio[]>([])
  const [habilidades, setHabilidades] = useState<HabilidadCat[]>([])
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
    // Campos ricos (opcionales)
    objetivo: '',
    impacto_esperado: '',
    actividades_voluntario: '',
    perfil_beneficiarios: '',
    que_llevar: '',
    recomendaciones: '',
    politica_cancelacion: '',
    nivel_experiencia: '',
    horas_reconocidas: '0',
    fecha_limite_postulacion: '',
    dificultad: 'FACIL',
  })
  const [bene, setBene] = useState({
    incluye_transporte: false,
    incluye_alimentacion: false,
    incluye_seguro: false,
    otorga_certificado: false,
    urgente: false,
  })
  const [habsSel, setHabsSel] = useState<number[]>([])
  const [fotos, setFotos] = useState<File[]>([])
  const previews = useMemo(() => fotos.map((f) => URL.createObjectURL(f)), [fotos])
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews])
  const [recurrente, setRecurrente] = useState(false)
  const [rec, setRec] = useState({ intervalo: '1', unidad: 'SEMANAS', duracion: '1' })

  useEffect(() => {
    Promise.all([
      convocatoriaService.areasImpacto(),
      convocatoriaService.municipios(),
      habilidadService.catalogo(),
    ])
      .then(([a, m, h]) => {
        setAreas(a)
        setMunicipios(m)
        setHabilidades(h)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!editId) return
    let active = true
    convocatoriaService
      .miConvocatoria(editId)
      .then((c) => {
        if (!active) return
        const s = (v: string | number | null | undefined) => (v == null ? '' : String(v))
        setOriginal(c)
        setForm({
          titulo: c.titulo,
          descripcion: c.descripcion,
          categoria_id: s(c.categoria_id),
          modalidad: c.modalidad,
          municipio_id: s(c.municipio_id),
          direccion_exacta: s(c.direccion_exacta),
          enlace_virtual: s(c.enlace_virtual),
          fecha_inicio: c.fecha_inicio,
          fecha_fin: c.fecha_fin,
          hora_inicio: s(c.hora_inicio).slice(0, 5),
          hora_fin: s(c.hora_fin).slice(0, 5),
          cupo_maximo: s(c.cupo_maximo),
          requisitos_adicionales: s(c.requisitos_adicionales),
          contacto_nombre: s(c.contacto_nombre),
          contacto_email: s(c.contacto_email),
          contacto_telefono: s(c.contacto_telefono),
          objetivo: s(c.objetivo),
          impacto_esperado: s(c.impacto_esperado),
          actividades_voluntario: s(c.actividades_voluntario),
          perfil_beneficiarios: s(c.perfil_beneficiarios),
          que_llevar: s(c.que_llevar),
          recomendaciones: s(c.recomendaciones),
          politica_cancelacion: s(c.politica_cancelacion),
          nivel_experiencia: s(c.nivel_experiencia),
          horas_reconocidas: s(c.horas_reconocidas ?? 0),
          fecha_limite_postulacion: s(c.fecha_limite_postulacion),
          dificultad: c.dificultad || 'FACIL',
        })
        setBene({
          incluye_transporte: c.incluye_transporte,
          incluye_alimentacion: c.incluye_alimentacion,
          incluye_seguro: c.incluye_seguro,
          otorga_certificado: c.otorga_certificado,
          urgente: c.urgente,
        })
        setHabsSel(c.habilidades.map((h) => h.id))
        setFotosActuales((c.imagenes ?? []).map((i) => ({ id: i.id, ruta: i.ruta })))
      })
      .catch((err) => active && setError(parseApiError(err).message))
      .finally(() => active && setCargando(false))
    return () => {
      active = false
    }
  }, [editId])

  const quitarFotoActual = async (imagenId: string) => {
    if (!editId) return
    try {
      const c = await convocatoriaService.eliminarImagen(editId, imagenId)
      setFotosActuales((c.imagenes ?? []).map((i) => ({ id: i.id, ruta: i.ruta })))
    } catch (err) {
      setError(parseApiError(err).message)
    }
  }

  const cupoFotos = MAX_FOTOS - fotosActuales.length

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }))

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
      // Campos ricos
      if (form.objetivo) payload.objetivo = form.objetivo
      if (form.impacto_esperado) payload.impacto_esperado = form.impacto_esperado
      if (form.actividades_voluntario) payload.actividades_voluntario = form.actividades_voluntario
      if (form.perfil_beneficiarios) payload.perfil_beneficiarios = form.perfil_beneficiarios
      if (form.que_llevar) payload.que_llevar = form.que_llevar
      if (form.recomendaciones) payload.recomendaciones = form.recomendaciones
      if (form.politica_cancelacion) payload.politica_cancelacion = form.politica_cancelacion
      if (form.nivel_experiencia) payload.nivel_experiencia = form.nivel_experiencia
      if (form.fecha_limite_postulacion) payload.fecha_limite_postulacion = form.fecha_limite_postulacion
      payload.horas_reconocidas = Number(form.horas_reconocidas) || 0
      payload.dificultad = form.dificultad
      payload.incluye_transporte = bene.incluye_transporte
      payload.incluye_alimentacion = bene.incluye_alimentacion
      payload.incluye_seguro = bene.incluye_seguro
      payload.otorga_certificado = bene.otorga_certificado
      payload.urgente = bene.urgente

      if (recurrente) {
        const { fecha_inicio, hora_inicio, hora_fin, cupo_maximo, ...plantilla } = payload
        const prog = await programacionService.crear({
          unidad_intervalo: rec.unidad as UnidadIntervalo,
          intervalo: Number(rec.intervalo),
          fecha_inicio,
          duracion_dias: Number(rec.duracion),
          hora_inicio,
          hora_fin,
          cupo_maximo,
          plantilla: plantilla as unknown as Record<string, unknown>,
        })
        // Las fotos quedan en la programación y se copian a cada convocatoria generada.
        for (const foto of fotos) {
          await programacionService.subirImagen(prog.id, foto)
        }
        navigate('/app/programaciones', { replace: true })
        return
      }

      if (editId) {
        if (!requierePresencia) {
          payload.municipio_id = null as unknown as number
          payload.direccion_exacta = null as unknown as string
        }
        await convocatoriaService.actualizar(editId, payload)
        for (const foto of fotos) {
          await convocatoriaService.subirImagen(editId, foto)
        }
        if (publicar) await convocatoriaService.publicar(editId)
        navigate('/app/mis-convocatorias', { replace: true })
        return
      }

      const creada = await convocatoriaService.crear(payload)
      for (const foto of fotos) {
        await convocatoriaService.subirImagen(creada.id, foto)
      }
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
        {editando ? 'Editar convocatoria' : 'Nueva convocatoria'}
      </h1>
      <p className="mt-1 text-ink-500 dark:text-ink-400">
        {editando
          ? 'Los cambios se verán de inmediato para los voluntarios.'
          : 'Publica una oportunidad de voluntariado para tu fundación.'}
      </p>
      {editando && original?.estado === 'PUBLICADA' && (original.postulaciones_total ?? 0) > 0 && (
        <Alert tone="info" className="mt-4">
          Esta convocatoria ya tiene {original.postulaciones_total} postulación(es). Si cambias la
          fecha, el horario o el lugar, avisa a los voluntarios por mensaje.
        </Alert>
      )}
      {cargando && (
        <div className="flex justify-center py-20">
          <Loader2 className="size-8 animate-spin text-solar-500" />
        </div>
      )}

      <form
        hidden={cargando}
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

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">
            Fotografías (opcional, hasta {MAX_FOTOS})
          </label>
          {fotosActuales.length > 0 && (
            <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {fotosActuales.map((f, i) => (
                <div key={f.id} className="relative overflow-hidden rounded-xl border border-ink-200 dark:border-ink-700">
                  <img src={f.ruta} alt="" className="h-24 w-full object-cover" />
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 rounded bg-solar-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      Portada
                    </span>
                  )}
                  <button
                    type="button"
                    aria-label="Eliminar foto"
                    onClick={() => quitarFotoActual(f.id)}
                    className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-red-500 shadow hover:bg-white"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {previews.length > 0 && (
            <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {previews.map((src, i) => (
                <div key={src} className="relative overflow-hidden rounded-xl border border-ink-200 dark:border-ink-700">
                  <img src={src} alt="" className="h-24 w-full object-cover" />
                  {i === 0 && fotosActuales.length === 0 && (
                    <span className="absolute bottom-1 left-1 rounded bg-solar-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      Portada
                    </span>
                  )}
                  {fotosActuales.length > 0 && (
                    <span className="absolute bottom-1 left-1 rounded bg-ink-900/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      Nueva
                    </span>
                  )}
                  <button
                    type="button"
                    aria-label="Quitar foto"
                    onClick={() => setFotos((fs) => fs.filter((_, j) => j !== i))}
                    className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-red-500 shadow hover:bg-white"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {fotos.length < cupoFotos && (
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink-300 bg-ink-50/60 px-4 py-5 text-sm font-semibold text-ink-700 transition hover:border-solar-400 hover:bg-solar-50 hover:text-solar-700 dark:border-ink-600 dark:bg-ink-800/40 dark:text-ink-200">
              <ImagePlus className="size-5" /> Agregar fotos (JPG, PNG o WEBP, máx. 5 MB)
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  const nuevas = Array.from(e.target.files ?? [])
                  setFotos((fs) => [...fs, ...nuevas].slice(0, cupoFotos))
                  e.target.value = ''
                }}
              />
            </label>
          )}
          {recurrente && fotos.length > 0 && (
            <p className="mt-2 text-xs text-ink-500">
              Las fotos se copiarán a cada convocatoria que genere la actividad recurrente.
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-ink-700 dark:text-ink-200">
            Habilidades requeridas (entre {MIN_HABILIDADES} y {MAX_HABILIDADES} para publicar)
          </label>
          <HabilidadesPicker catalogo={habilidades} value={habsSel} onChange={setHabsSel} />
        </div>

        <div hidden={editando} className="rounded-xl border border-ink-200/60 p-4 dark:border-ink-700">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-ink-800 dark:text-ink-100">
            <input
              type="checkbox"
              checked={recurrente}
              onChange={(e) => setRecurrente(e.target.checked)}
              className="size-4 rounded border-ink-300 text-solar-500"
            />
            Es una actividad recurrente
          </label>
          {recurrente && (
            <div className="mt-3 space-y-2">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Input
                  label="Repetir cada"
                  type="number"
                  min={1}
                  value={rec.intervalo}
                  onChange={(e) => setRec((r) => ({ ...r, intervalo: e.target.value }))}
                />
                <Select
                  label="Unidad"
                  options={[
                    { value: 'DIAS', label: 'Días' },
                    { value: 'SEMANAS', label: 'Semanas' },
                    { value: 'MESES', label: 'Meses' },
                  ]}
                  value={rec.unidad}
                  onChange={(e) => setRec((r) => ({ ...r, unidad: e.target.value }))}
                />
                <Input
                  label="Duración (días)"
                  type="number"
                  min={1}
                  value={rec.duracion}
                  onChange={(e) => setRec((r) => ({ ...r, duracion: e.target.value }))}
                />
              </div>
              <p className="text-xs text-ink-500">
                Se publican hasta {MAX_CICLO} convocatorias por ciclo. Luego la programación se
                pausa hasta que la autorices en “Actividades recurrentes”. La fecha de inicio es la
                primera; la fecha fin se calcula con la duración.
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input label="Contacto" placeholder="Nombre" value={form.contacto_nombre} onChange={(e) => set('contacto_nombre', e.target.value)} />
          <Input label="Email contacto" type="email" value={form.contacto_email} onChange={(e) => set('contacto_email', e.target.value)} />
          <Input label="Teléfono contacto" value={form.contacto_telefono} onChange={(e) => set('contacto_telefono', e.target.value)} />
        </div>

        {/* Detalles adicionales (opcionales) para una convocatoria rica */}
        <details className="group rounded-xl border border-ink-200/60 p-4 dark:border-ink-700">
          <summary className="cursor-pointer select-none text-sm font-semibold text-ink-800 dark:text-ink-100">
            Detalles adicionales (recomendado)
          </summary>
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select
                label="Dificultad"
                options={[
                  { value: 'FACIL', label: 'Fácil' },
                  { value: 'MEDIA', label: 'Media' },
                  { value: 'DIFICIL', label: 'Difícil' },
                  { value: 'MUY_DIFICIL', label: 'Muy difícil' },
                ]}
                value={form.dificultad}
                onChange={(e) => set('dificultad', e.target.value)}
              />
              <Input label="Nivel de experiencia requerido" placeholder="Ej: Ninguno / Intermedio" value={form.nivel_experiencia} onChange={(e) => set('nivel_experiencia', e.target.value)} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Horas de voluntariado reconocidas" type="number" min={0} value={form.horas_reconocidas} onChange={(e) => set('horas_reconocidas', e.target.value)} />
              <Input label="Fecha límite de postulación" type="date" value={form.fecha_limite_postulacion} onChange={(e) => set('fecha_limite_postulacion', e.target.value)} />
            </div>
            <TextArea label="Objetivo de la actividad" value={form.objetivo} onChange={(v) => set('objetivo', v)} />
            <TextArea label="Impacto social esperado" value={form.impacto_esperado} onChange={(v) => set('impacto_esperado', v)} />
            <TextArea label="¿Qué harán los voluntarios?" value={form.actividades_voluntario} onChange={(v) => set('actividades_voluntario', v)} />
            <TextArea label="Perfil de los beneficiarios" value={form.perfil_beneficiarios} onChange={(v) => set('perfil_beneficiarios', v)} />
            <TextArea label="¿Qué deben llevar?" value={form.que_llevar} onChange={(v) => set('que_llevar', v)} />
            <TextArea label="Recomendaciones" value={form.recomendaciones} onChange={(v) => set('recomendaciones', v)} />
            <TextArea label="Política de cancelación" value={form.politica_cancelacion} onChange={(v) => set('politica_cancelacion', v)} />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <Check label="Incluye transporte" checked={bene.incluye_transporte} onChange={(v) => setBene((b) => ({ ...b, incluye_transporte: v }))} />
              <Check label="Incluye alimentación" checked={bene.incluye_alimentacion} onChange={(v) => setBene((b) => ({ ...b, incluye_alimentacion: v }))} />
              <Check label="Incluye seguro" checked={bene.incluye_seguro} onChange={(v) => setBene((b) => ({ ...b, incluye_seguro: v }))} />
              <Check label="Otorga certificado" checked={bene.otorga_certificado} onChange={(v) => setBene((b) => ({ ...b, otorga_certificado: v }))} />
              <Check label="Marcar como urgente" checked={bene.urgente} onChange={(v) => setBene((b) => ({ ...b, urgente: v }))} />
            </div>
          </div>
        </details>

        <div className="flex flex-col gap-3 border-t border-ink-200/60 pt-5 sm:flex-row dark:border-ink-700">
          {editando && original?.estado !== 'BORRADOR' && original?.estado !== 'PENDIENTE_APROBACION' ? (
            <Button type="submit" size="lg" loading={saving} fullWidth>
              Guardar cambios
            </Button>
          ) : (
            <>
              <Button type="submit" variant="outline" size="lg" loading={saving} fullWidth>
                {editando ? 'Guardar cambios' : 'Guardar borrador'}
              </Button>
              <Button type="button" size="lg" loading={saving} fullWidth onClick={() => submit(true)}>
                {editando ? 'Guardar y publicar' : 'Publicar ahora'}
              </Button>
            </>
          )}
        </div>
      </form>
    </div>
  )
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">
        {label}
      </label>
      <textarea
        rows={2}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-ink-200 bg-white/80 px-3.5 py-2.5 text-sm text-ink-900 shadow-sm transition focus:border-solar-400 focus:outline-none focus:ring-2 focus:ring-solar-400/70 dark:border-ink-700 dark:bg-ink-900/60 dark:text-white"
      />
    </div>
  )
}

function Check({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-700 dark:text-ink-200">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 rounded border-ink-300 text-solar-500 focus:ring-solar-400"
      />
      {label}
    </label>
  )
}
