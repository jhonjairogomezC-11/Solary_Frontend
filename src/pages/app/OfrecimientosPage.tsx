import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Gift, Loader2 } from 'lucide-react'

import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useAuth } from '@/auth/AuthContext'
import { parseApiError } from '@/lib/apiClient'
import { habilidadService, ofrecimientoService } from '@/services/alineacionService'
import { convocatoriaService } from '@/services/convocatoriaService'
import type {
  CategoriasOfrecimiento,
  HabilidadCat,
  Ofrecimiento,
  OfrecimientoCreate,
} from '@/types/alineacion'
import type { Municipio } from '@/types/convocatoria'

const ETIQUETAS: Record<string, string> = {
  NUEVO: 'Nuevo',
  COMO_NUEVO: 'Como nuevo',
  USADO_BUEN_ESTADO: 'Usado en buen estado',
  USADO: 'Usado',
  RECOGER_EN_LUGAR: 'Recoger en el lugar',
  ENTREGA_POR_VOLUNTARIO: 'Entrega el voluntario',
  A_CONVENIR: 'A convenir',
  PRESENCIAL: 'Presencial',
  REMOTO: 'Remoto',
}
const opciones = (vals: string[] | undefined) =>
  (vals ?? []).map((v) => ({ value: v, label: ETIQUETAS[v] ?? v }))

const inicial = {
  tipo: 'OBJETO',
  titulo: '',
  descripcion: '',
  categoria: '',
  cantidad_total: '1',
  condiciones: '',
  estado_producto: '',
  modalidad_entrega: '',
  municipio_id: '',
  habilidades: [] as number[],
}

export function OfrecimientosPage() {
  const { usuario } = useAuth()
  const esVoluntario = usuario?.rol === 'VOLUNTARIO'
  const esFundacion = usuario?.rol === 'FUNDACION'

  const [tab, setTab] = useState<'explorar' | 'mios'>(esVoluntario ? 'mios' : 'explorar')
  const [items, setItems] = useState<Ofrecimiento[]>([])
  const [cats, setCats] = useState<CategoriasOfrecimiento | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)
  const [buscar, setBuscar] = useState('')
  const [form, setForm] = useState(inicial)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [cantidades, setCantidades] = useState<Record<string, string>>({})
  const [municipios, setMunicipios] = useState<Municipio[]>([])
  const [habilidadesCat, setHabilidadesCat] = useState<HabilidadCat[]>([])

  const cargar = useCallback(async () => {
    try {
      const lista =
        tab === 'mios'
          ? await ofrecimientoService.mios()
          : (await ofrecimientoService.listar({ buscar: buscar || undefined })).data
      setItems(lista)
    } catch (e) {
      setError(parseApiError(e).message)
    } finally {
      setLoading(false)
    }
  }, [tab, buscar])

  useEffect(() => {
    let active = true
    ofrecimientoService
      .categorias()
      .then((c) => active && setCats(c))
      .catch(() => {})
    convocatoriaService
      .municipios()
      .then((m) => active && setMunicipios(m))
      .catch(() => {})
    habilidadService
      .catalogo()
      .then((h) => active && setHabilidadesCat(h))
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    const p =
      tab === 'mios'
        ? ofrecimientoService.mios()
        : ofrecimientoService.listar({ buscar: buscar || undefined }).then((r) => r.data)
    p.then((r) => active && setItems(r))
      .catch((e) => active && setError(parseApiError(e).message))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [tab, buscar])

  const categorias = form.tipo === 'OBJETO' ? cats?.objetos : cats?.servicios

  const crear = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.tipo === 'SERVICIO' && form.habilidades.length === 0) {
      setError('Elige al menos una habilidad para el servicio.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const payload: OfrecimientoCreate = {
        tipo: form.tipo as OfrecimientoCreate['tipo'],
        titulo: form.titulo,
        descripcion: form.descripcion,
        categoria: form.categoria,
        modalidad_entrega: form.modalidad_entrega,
        ...(form.tipo === 'OBJETO'
          ? { cantidad_total: Number(form.cantidad_total), estado_producto: form.estado_producto }
          : { habilidades: form.habilidades }),
        ...(form.municipio_id ? { municipio_id: Number(form.municipio_id) } : {}),
        ...(form.condiciones ? { condiciones: form.condiciones } : {}),
      }
      await ofrecimientoService.crear(payload)
      setForm(inicial)
      setMostrarForm(false)
      setOk('Publicación creada. Las organizaciones ya pueden ver tu ofrecimiento.')
      await cargar()
    } catch (err) {
      setError(parseApiError(err).message)
    } finally {
      setSaving(false)
    }
  }

  const estado = async (id: string, accion: 'pausar' | 'reanudar' | 'finalizar') => {
    try {
      await ofrecimientoService.cambiarEstado(id, accion)
      await cargar()
    } catch (e) {
      setError(parseApiError(e).message)
    }
  }

  const imagen = async (id: string, file: File | undefined) => {
    if (!file) return
    try {
      await ofrecimientoService.subirImagen(id, file)
      await cargar()
    } catch (e) {
      setError(parseApiError(e).message)
    }
  }

  const meInteresa = async (o: Ofrecimiento) => {
    setError(null)
    setOk(null)
    try {
      await ofrecimientoService.meInteresa(o.id, Number(cantidades[o.id] ?? 1))
      setOk('Solicitud enviada. Puedes coordinar con el voluntario en “Solicitudes”.')
      await cargar()
    } catch (e) {
      setError(parseApiError(e).message)
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink-900 dark:text-white">
            Objetos y servicios
          </h1>
          <p className="mt-1 text-ink-500 dark:text-ink-400">
            Donaciones y servicios voluntarios gratuitos. Solari no maneja pagos ni intercambios
            comerciales.
          </p>
        </div>
        <Link to="/app/solicitudes-interes">
          <Button variant="outline" size="sm">Solicitudes</Button>
        </Link>
      </div>

      <div className="mt-4 flex gap-2">
        {esVoluntario && (
          <Button size="sm" variant={tab === 'mios' ? 'primary' : 'outline'} onClick={() => { if (tab !== 'mios') { setLoading(true); setTab('mios') } }}>
            Mis publicaciones
          </Button>
        )}
        <Button size="sm" variant={tab === 'explorar' ? 'primary' : 'outline'} onClick={() => { if (tab !== 'explorar') { setLoading(true); setTab('explorar') } }}>
          Explorar
        </Button>
      </div>

      {error && <Alert tone="error" className="mt-4">{error}</Alert>}
      {ok && <Alert tone="success" className="mt-4">{ok}</Alert>}

      {tab === 'explorar' && (
        <div className="mt-4 max-w-sm">
          <Input label="Buscar" value={buscar} onChange={(e) => setBuscar(e.target.value)} />
        </div>
      )}

      {tab === 'mios' && esVoluntario && (
        <div className="mt-4">
          {!mostrarForm ? (
            <Button onClick={() => setMostrarForm(true)}>Publicar objeto o servicio</Button>
          ) : (
            <form
              onSubmit={crear}
              className="space-y-3 rounded-2xl border border-ink-200/60 bg-white/70 p-4 dark:border-ink-700/60 dark:bg-ink-900/50"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Select
                  label="Tipo"
                  options={[
                    { value: 'OBJETO', label: 'Objeto' },
                    { value: 'SERVICIO', label: 'Servicio' },
                  ]}
                  value={form.tipo}
                  onChange={(e) =>
                    setForm({ ...form, tipo: e.target.value, categoria: '', modalidad_entrega: '', habilidades: [] })
                  }
                />
                <Select
                  label="Categoría"
                  placeholder="Selecciona"
                  options={(categorias ?? []).map((c) => ({ value: c, label: c }))}
                  value={form.categoria}
                  onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                  required
                />
              </div>
              <Input label="Título" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} required />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">Descripción</label>
                <textarea
                  rows={3}
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  className="w-full rounded-xl border border-ink-200 bg-white/80 px-3.5 py-2.5 text-sm dark:border-ink-700 dark:bg-ink-900/60 dark:text-white"
                  required
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {form.tipo === 'OBJETO' && (
                  <>
                    <Input label="Cantidad" type="number" min={1} value={form.cantidad_total} onChange={(e) => setForm({ ...form, cantidad_total: e.target.value })} />
                    <Select
                      label="Estado del objeto"
                      placeholder="Selecciona"
                      options={opciones(cats?.estados_producto)}
                      value={form.estado_producto}
                      onChange={(e) => setForm({ ...form, estado_producto: e.target.value })}
                      required
                    />
                  </>
                )}
                <Select
                  label={form.tipo === 'OBJETO' ? 'Forma de entrega' : 'Modalidad del servicio'}
                  placeholder="Selecciona"
                  options={opciones(form.tipo === 'OBJETO' ? cats?.modalidades_entrega : cats?.modalidades_servicio)}
                  value={form.modalidad_entrega}
                  onChange={(e) => setForm({ ...form, modalidad_entrega: e.target.value })}
                  required
                />
                <Select
                  label={
                    form.tipo === 'OBJETO' || form.modalidad_entrega === 'PRESENCIAL'
                      ? 'Municipio'
                      : 'Municipio (opcional)'
                  }
                  placeholder="Selecciona"
                  options={municipios.map((m) => ({ value: m.id, label: m.nombre }))}
                  value={form.municipio_id}
                  onChange={(e) => setForm({ ...form, municipio_id: e.target.value })}
                  required={form.tipo === 'OBJETO' || form.modalidad_entrega === 'PRESENCIAL'}
                />
              </div>
              {form.tipo === 'SERVICIO' && (
                <div>
                  <p className="mb-1.5 text-sm font-medium text-ink-700 dark:text-ink-200">
                    Habilidades (elige al menos una, máximo 10)
                  </p>
                  <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto">
                    {habilidadesCat.map((h) => {
                      const activa = form.habilidades.includes(h.id)
                      return (
                        <button
                          key={h.id}
                          type="button"
                          onClick={() =>
                            setForm({
                              ...form,
                              habilidades: activa
                                ? form.habilidades.filter((x) => x !== h.id)
                                : form.habilidades.length < 10
                                  ? [...form.habilidades, h.id]
                                  : form.habilidades,
                            })
                          }
                          className={
                            'rounded-full border px-3 py-1 text-xs font-medium transition ' +
                            (activa
                              ? 'border-solar-500 bg-solar-500 text-white'
                              : 'border-ink-200 text-ink-600 hover:border-solar-400 dark:border-ink-700 dark:text-ink-300')
                          }
                        >
                          {h.nombre}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
              <Input label="Condiciones (opcional)" value={form.condiciones} onChange={(e) => setForm({ ...form, condiciones: e.target.value })} />
              <div className="flex gap-2">
                <Button type="submit" loading={saving}>Publicar</Button>
                <Button type="button" variant="ghost" onClick={() => setMostrarForm(false)}>Cancelar</Button>
              </div>
            </form>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="size-8 animate-spin text-solar-500" />
        </div>
      ) : items.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-ink-300 py-16 text-center dark:border-ink-700">
          <Gift className="mx-auto size-10 text-ink-300" />
          <p className="mt-3 text-ink-500">No hay publicaciones.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {items.map((o) => (
            <div
              key={o.id}
              className="rounded-2xl border border-ink-200/60 bg-white/70 p-4 dark:border-ink-700/60 dark:bg-ink-900/50"
            >
              {o.imagenes[0] && (
                <img src={o.imagenes[0]} alt={o.titulo} className="mb-3 h-36 w-full rounded-xl object-cover" />
              )}
              <div className="flex items-center gap-2">
                <Badge tone={o.tipo === 'OBJETO' ? 'solar' : 'purple'}>{o.tipo === 'OBJETO' ? 'Objeto' : 'Servicio'}</Badge>
                <Badge tone="gray">{o.estado}</Badge>
              </div>
              <p className="mt-2 font-display text-lg font-bold text-ink-900 dark:text-white">{o.titulo}</p>
              <p className="text-xs text-ink-500">
                {o.categoria}
                {o.voluntario_nombre && ` · ${o.voluntario_nombre}`}
                {o.tipo === 'OBJETO' && ` · ${o.cantidad_disponible}/${o.cantidad_total} disponibles`}
              </p>
              <p className="mt-2 line-clamp-3 text-sm text-ink-600 dark:text-ink-300">{o.descripcion}</p>

              {o.es_mio && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {o.estado === 'DISPONIBLE' && (
                    <Button size="sm" variant="outline" onClick={() => estado(o.id, 'pausar')}>Pausar</Button>
                  )}
                  {o.estado === 'PAUSADO' && (
                    <Button size="sm" variant="outline" onClick={() => estado(o.id, 'reanudar')}>Reanudar</Button>
                  )}
                  <Button size="sm" variant="outline" className="text-red-500" onClick={() => estado(o.id, 'finalizar')}>
                    Finalizar
                  </Button>
                  <label className="cursor-pointer text-xs text-solar-600 hover:underline">
                    + Foto
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => imagen(o.id, e.target.files?.[0])} />
                  </label>
                  {!!o.solicitudes_pendientes && (
                    <span className="text-xs text-amber-600">{o.solicitudes_pendientes} solicitud(es) pendiente(s)</span>
                  )}
                </div>
              )}

              {esFundacion && !o.es_mio && o.estado === 'DISPONIBLE' && (
                <div className="mt-3 flex items-end gap-2">
                  {o.ya_solicitado ? (
                    <Badge tone="gray">Solicitud enviada</Badge>
                  ) : (
                    <>
                  {o.tipo === 'OBJETO' && (
                    <input
                      type="number"
                      min={1}
                      max={o.cantidad_disponible}
                      value={cantidades[o.id] ?? '1'}
                      onChange={(e) => setCantidades({ ...cantidades, [o.id]: e.target.value })}
                      className="w-20 rounded-lg border border-ink-200 px-2 py-1.5 text-sm dark:border-ink-700 dark:bg-ink-900"
                    />
                  )}
                  <Button size="sm" onClick={() => meInteresa(o)}>Me interesa</Button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
