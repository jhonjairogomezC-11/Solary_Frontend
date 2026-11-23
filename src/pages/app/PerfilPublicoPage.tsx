import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { FileText, ImagePlus, Loader2, ShieldCheck, Trash2, Upload } from 'lucide-react'

import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { abrirArchivoPrivado } from '@/lib/archivos'
import { parseApiError } from '@/lib/apiClient'
import { organizacionService } from '@/services/alineacionService'
import { convocatoriaService } from '@/services/convocatoriaService'
import type { OrganizacionPublica, VerificacionEstado } from '@/types/alineacion'
import type { AreaImpacto, PerfilFundacion } from '@/types/convocatoria'

const TIPOS_DOC = [
  { value: 'CAMARA_COMERCIO', label: 'Cámara de comercio' },
  { value: 'RUT', label: 'RUT' },
  { value: 'ESTATUTOS', label: 'Estatutos' },
  { value: 'CEDULA_REPRESENTANTE', label: 'Cédula del representante' },
  { value: 'OTRO', label: 'Otro' },
]

const textareaCls =
  'w-full rounded-xl border border-ink-200 bg-white/80 px-3.5 py-2.5 text-sm text-ink-900 shadow-sm focus:border-solar-400 focus:outline-none focus:ring-2 focus:ring-solar-400/70 dark:border-ink-700 dark:bg-ink-900/60 dark:text-white'

function Card({
  title,
  description,
  badge,
  children,
}: {
  title: string
  description?: ReactNode
  badge?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="rounded-2xl border border-ink-200 bg-white/70 p-6 shadow-sm dark:border-ink-700 dark:bg-ink-900/40">
      <header className="mb-5 border-b border-ink-100 pb-4 dark:border-ink-800">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-lg font-bold text-ink-900 dark:text-white">{title}</h2>
          {badge}
        </div>
        {description && <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">{description}</p>}
      </header>
      <div className="space-y-5">{children}</div>
    </section>
  )
}

function FileButton({
  label,
  accept,
  icon,
  onFile,
}: {
  label: string
  accept: string
  icon: ReactNode
  onFile: (f: File) => void
}) {
  return (
    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink-300 bg-ink-50/60 px-4 py-5 text-sm font-semibold text-ink-700 transition hover:border-solar-400 hover:bg-solar-50 hover:text-solar-700 dark:border-ink-600 dark:bg-ink-800/40 dark:text-ink-200 dark:hover:bg-solar-500/10">
      {icon}
      {label}
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onFile(f)
          e.target.value = ''
        }}
      />
    </label>
  )
}

function CheckRow({
  checked,
  onChange,
  children,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  children: ReactNode
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm text-ink-700 transition hover:bg-ink-50 dark:border-ink-700 dark:text-ink-200 dark:hover:bg-ink-800/50">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 accent-solar-500"
      />
      {children}
    </label>
  )
}

export function PerfilPublicoPage() {
  const [perfil, setPerfil] = useState<PerfilFundacion | null>(null)
  const [org, setOrg] = useState<OrganizacionPublica | null>(null)
  const [areas, setAreas] = useState<AreaImpacto[]>([])
  const [verif, setVerif] = useState<VerificacionEstado | null>(null)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState<{ tone: 'success' | 'error'; text: string } | null>(null)

  const [historia, setHistoria] = useState('')
  const [mision, setMision] = useState('')
  const [areasSel, setAreasSel] = useState<number[]>([])
  const [priv, setPriv] = useState({ tel: false, mail: false, dir: false })
  const [tipoDoc, setTipoDoc] = useState('CAMARA_COMERCIO')
  const [galeria, setGaleria] = useState({ menores: false, autoriza: false, desc: '' })

  const aplicar = (o: OrganizacionPublica, p: PerfilFundacion | null) => {
    setOrg(o)
    setHistoria(o.historia ?? '')
    setMision(o.mision ?? '')
    setAreasSel(o.areas.map((a) => a.id))
    if (p) setPriv({ tel: !!p.mostrar_telefono, mail: !!p.mostrar_correo, dir: !!p.mostrar_direccion })
  }

  const cargar = useCallback(async () => {
    const p = await convocatoriaService.miPerfilFundacion()
    if (!p) return
    setPerfil(p)
    const [o, v] = await Promise.all([organizacionService.perfil(p.id), organizacionService.verificacion()])
    aplicar(o, p)
    setVerif(v)
  }, [])

  useEffect(() => {
    let active = true
    Promise.all([
      convocatoriaService.miPerfilFundacion().then(async (p) => {
        if (!p) return null
        const [o, v] = await Promise.all([
          organizacionService.perfil(p.id),
          organizacionService.verificacion(),
        ])
        return { p, o, v }
      }),
      convocatoriaService.areasImpacto(),
    ])
      .then(([datos, a]) => {
        if (!active) return
        setAreas(a)
        if (datos) {
          setPerfil(datos.p)
          setVerif(datos.v)
          aplicar(datos.o, datos.p)
        }
      })
      .catch((e) => active && setMsg({ tone: 'error', text: parseApiError(e).message }))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const run = async (ok: string, fn: () => Promise<unknown>) => {
    setMsg(null)
    try {
      await fn()
      await cargar()
      setMsg({ tone: 'success', text: ok })
    } catch (e) {
      setMsg({ tone: 'error', text: parseApiError(e).message })
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="size-8 animate-spin text-solar-500" />
      </div>
    )
  if (!perfil || !org) return <Alert tone="info">Completa primero tu perfil de organización.</Alert>

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink-900 dark:text-white">
          Perfil público
        </h1>
        <Link to={`/app/organizaciones/${perfil.id}`} className="text-sm text-solar-600 hover:underline">
          Ver cómo lo ven los voluntarios
        </Link>
      </div>
      {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}

      <Card title="Presentación" description="Cuenta quiénes son y a qué se dedican. Es lo primero que ven los voluntarios.">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">Historia</label>
          <textarea rows={3} value={historia} onChange={(e) => setHistoria(e.target.value)} className={textareaCls} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">Misión</label>
          <textarea rows={3} value={mision} onChange={(e) => setMision(e.target.value)} className={textareaCls} />
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-ink-700 dark:text-ink-200">Áreas de impacto</p>
          <div className="flex flex-wrap gap-2">
            {areas.map((a) => {
              const on = areasSel.includes(a.id)
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setAreasSel(on ? areasSel.filter((x) => x !== a.id) : [...areasSel, a.id])}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${on ? 'border-solar-500 bg-solar-500 text-white' : 'border-ink-200 text-ink-700 hover:border-solar-300 dark:border-ink-700 dark:text-ink-200'}`}
                >
                  {a.nombre}
                </button>
              )
            })}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-ink-700 dark:text-ink-200">Datos de contacto visibles</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {([['tel', 'Teléfono'], ['mail', 'Correo'], ['dir', 'Dirección']] as const).map(([k, l]) => (
              <CheckRow key={k} checked={priv[k]} onChange={(v) => setPriv({ ...priv, [k]: v })}>
                Mostrar {l.toLowerCase()}
              </CheckRow>
            ))}
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            onClick={() =>
              run('Perfil público actualizado.', () =>
                organizacionService.actualizarPublico({
                  historia: historia || null,
                  mision: mision || null,
                  areas: areasSel,
                  mostrar_telefono: priv.tel,
                  mostrar_correo: priv.mail,
                  mostrar_direccion: priv.dir,
                }),
              )
            }
          >
            Guardar cambios
          </Button>
        </div>
      </Card>

      <Card
        title="Galería"
        description="Si la foto muestra menores de edad debes contar con la autorización de uso de imagen de sus representantes."
      >
        {org.galeria.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {org.galeria.map((g) => (
              <div key={g.id} className="relative overflow-hidden rounded-xl border border-ink-200 dark:border-ink-700">
                <img src={g.ruta} alt="" className="h-28 w-full object-cover" />
                <button
                  aria-label="Eliminar"
                  onClick={() => run('Foto eliminada.', () => organizacionService.eliminarGaleria(g.id))}
                  className="absolute right-1.5 top-1.5 rounded-full bg-white/90 p-1.5 text-red-500 shadow hover:bg-white"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="space-y-3 rounded-xl bg-ink-50/70 p-4 dark:bg-ink-800/30">
          <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">Agregar una foto</p>
          <Input
            label="Descripción de la foto (opcional)"
            value={galeria.desc}
            onChange={(e) => setGaleria({ ...galeria, desc: e.target.value })}
          />
          <div className="grid gap-2 sm:grid-cols-2">
            <CheckRow checked={galeria.menores} onChange={(v) => setGaleria({ ...galeria, menores: v })}>
              Aparecen menores de edad
            </CheckRow>
            <CheckRow checked={galeria.autoriza} onChange={(v) => setGaleria({ ...galeria, autoriza: v })}>
              Cuento con autorización de uso de imagen
            </CheckRow>
          </div>
          <FileButton
            label="Elegir foto y subir"
            accept="image/*"
            icon={<ImagePlus className="size-5" />}
            onFile={(f) =>
              run('Foto agregada.', () =>
                organizacionService.subirGaleria(f, {
                  descripcion: galeria.desc || undefined,
                  contiene_menores: galeria.menores,
                  autorizacion_imagen: galeria.autoriza,
                }),
              )
            }
          />
        </div>
      </Card>

      <Card
        title="Verificación documental"
        badge={verif && <Badge tone={verif.estado === 'VERIFICADA' ? 'green' : 'gray'}>{verif.estado}</Badge>}
        description={
          <>
            Los documentos son privados: solo los ve el equipo de Solari. La insignia la otorga un administrador.{' '}
            {verif?.aviso}
          </>
        }
      >
        {verif?.nota && <Alert tone="info">{verif.nota}</Alert>}

        <div>
          <p className="mb-2 text-sm font-semibold text-ink-800 dark:text-ink-100">1. Documentos subidos</p>
          {verif?.documentos.length ? (
            <ul className="space-y-2 text-sm">
              {verif.documentos.map((d) => (
                <li
                  key={d.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-ink-200 px-3.5 py-2.5 dark:border-ink-700"
                >
                  <button
                    className="flex min-w-0 items-center gap-2 text-left text-solar-700 hover:underline dark:text-solar-300"
                    onClick={() => abrirArchivoPrivado(d.ruta_archivo)}
                  >
                    <FileText className="size-4 shrink-0" />
                    <span className="truncate">
                      {d.tipo_documento} · {d.nombre_original}
                    </span>
                  </button>
                  <button
                    aria-label="Eliminar"
                    className="text-red-500 hover:text-red-600"
                    onClick={() => run('Documento eliminado.', () => organizacionService.eliminarDocumento(d.id))}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-xl border border-dashed border-ink-300 px-4 py-3 text-sm text-ink-500 dark:border-ink-600">
              Aún no has subido documentos.
            </p>
          )}
        </div>

        <div className="space-y-3 rounded-xl bg-ink-50/70 p-4 dark:bg-ink-800/30">
          <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">2. Subir un documento</p>
          <Select label="Tipo de documento" options={TIPOS_DOC} value={tipoDoc} onChange={(e) => setTipoDoc(e.target.value)} />
          <FileButton
            label="Elegir archivo (PDF o imagen) y subir"
            accept=".pdf,image/*"
            icon={<Upload className="size-5" />}
            onFile={(f) => run('Documento subido.', () => organizacionService.subirDocumento(tipoDoc, f))}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-4 dark:border-ink-800">
          <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">3. Enviar a revisión</p>
          <Button
            variant="outline"
            disabled={!verif?.documentos.length}
            onClick={() =>
              run('Solicitud enviada. Un administrador revisará tus documentos.', () =>
                organizacionService.solicitarVerificacion(),
              )
            }
          >
            <ShieldCheck className="size-4" /> Solicitar verificación
          </Button>
        </div>
      </Card>
    </div>
  )
}
