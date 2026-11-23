import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  BadgeCheck,
  Camera,
  CheckCircle2,
  Clock,
  FileText,
  ShieldCheck,
  Upload,
  UserCog,
} from 'lucide-react'

import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useAuth } from '@/auth/AuthContext'
import { parseApiError } from '@/lib/apiClient'
import { abrirArchivoPrivado } from '@/lib/archivos'
import { convocatoriaService } from '@/services/convocatoriaService'
import type { Municipio, PerfilFundacion, PerfilVoluntario } from '@/types/convocatoria'

const TIPO_DOC = [
  { value: 'CC', label: 'Cédula de ciudadanía' },
  { value: 'TI', label: 'Tarjeta de identidad' },
  { value: 'CE', label: 'Cédula de extranjería' },
  { value: 'PASAPORTE', label: 'Pasaporte' },
]
const GENEROS = [
  { value: 'MASCULINO', label: 'Masculino' },
  { value: 'FEMENINO', label: 'Femenino' },
  { value: 'OTRO', label: 'Otro' },
]
const DISPONIBILIDAD = [
  { value: 'ENTRE_SEMANA', label: 'Entre semana' },
  { value: 'FINES_DE_SEMANA', label: 'Fines de semana' },
  { value: 'FLEXIBLE', label: 'Horario flexible' },
]

export function CompletarPerfilPage() {
  const { usuario, refreshUsuario } = useAuth()
  const navigate = useNavigate()
  const esFundacion = usuario?.rol === 'FUNDACION'

  const [municipios, setMunicipios] = useState<Municipio[]>([])
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const [perfilVol, setPerfilVol] = useState<PerfilVoluntario | null>(null)
  const [perfilFund, setPerfilFund] = useState<PerfilFundacion | null>(null)
  const yaCompleto = esFundacion ? !!perfilFund : !!perfilVol

  const [vol, setVol] = useState({
    tipo_documento: '',
    numero_documento: '',
    fecha_nacimiento: '',
    genero: '',
    municipio_id: '',
    disponibilidad: '',
    experiencia: '',
    direccion: '',
    descripcion: '',
    telefono_contacto: '',
    nivel_educativo: '',
    profesion: '',
    idiomas: '',
    preferencia_modalidad: '',
    contacto_emergencia_nombre: '',
    contacto_emergencia_telefono: '',
  })
  const [fund, setFund] = useState({
    nombre_fundacion: '',
    tipo_organizacion: 'FUNDACION',
    constituida_legalmente: true,
    nit: '',
    representante_legal: '',
    correo_institucional: '',
    telefono_contacto: '',
    direccion: '',
    municipio_id: '',
    descripcion: '',
    documento_legal: '',
    pagina_web: '',
  })

  useEffect(() => {
    let active = true
    async function cargar() {
      try {
        const [muni, pv, pf] = await Promise.all([
          convocatoriaService.municipios(),
          esFundacion ? Promise.resolve(null) : convocatoriaService.miPerfilVoluntario(),
          esFundacion ? convocatoriaService.miPerfilFundacion() : Promise.resolve(null),
        ])
        if (!active) return
        setMunicipios(muni)
        if (pv) {
          setPerfilVol(pv)
          setVol({
            tipo_documento: pv.tipo_documento,
            numero_documento: pv.numero_documento,
            fecha_nacimiento: pv.fecha_nacimiento,
            genero: pv.genero,
            municipio_id: String(pv.municipio_id),
            disponibilidad: pv.disponibilidad,
            experiencia: pv.experiencia ?? '',
            direccion: pv.direccion ?? '',
            descripcion: pv.descripcion ?? '',
            telefono_contacto: pv.telefono_contacto ?? '',
            nivel_educativo: pv.nivel_educativo ?? '',
            profesion: pv.profesion ?? '',
            idiomas: pv.idiomas ?? '',
            preferencia_modalidad: pv.preferencia_modalidad ?? '',
            contacto_emergencia_nombre: pv.contacto_emergencia_nombre ?? '',
            contacto_emergencia_telefono: pv.contacto_emergencia_telefono ?? '',
          })
        }
        if (pf) {
          setPerfilFund(pf)
          setFund({
            nombre_fundacion: pf.nombre,
            tipo_organizacion: pf.tipo_organizacion ?? 'FUNDACION',
            constituida_legalmente: pf.constituida_legalmente ?? true,
            nit: pf.nit ?? '',
            representante_legal: pf.representante_legal,
            correo_institucional: pf.correo_institucional ?? '',
            telefono_contacto: pf.telefono,
            direccion: pf.direccion,
            municipio_id: String(pf.municipio_id),
            descripcion: pf.descripcion,
            documento_legal: pf.documento_legal ?? '',
            pagina_web: pf.pagina_web ?? '',
          })
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    void cargar()
    return () => {
      active = false
    }
  }, [esFundacion])

  const guardar = async () => {
    setError(null)
    setOk(null)
    setSaving(true)
    try {
      if (esFundacion) {
        const pf = await convocatoriaService.guardarPerfilFundacion({
          nombre_fundacion: fund.nombre_fundacion,
          tipo_organizacion: fund.tipo_organizacion,
          constituida_legalmente: fund.constituida_legalmente,
          nit: fund.constituida_legalmente ? fund.nit || undefined : undefined,
          representante_legal: fund.representante_legal,
          correo_institucional: fund.correo_institucional || undefined,
          telefono_contacto: fund.telefono_contacto,
          direccion: fund.direccion,
          municipio_id: Number(fund.municipio_id),
          descripcion: fund.descripcion,
          documento_legal: fund.constituida_legalmente ? fund.documento_legal || undefined : undefined,
          pagina_web: fund.pagina_web || undefined,
        })
        setPerfilFund(pf as PerfilFundacion)
      } else {
        const pv = await convocatoriaService.guardarPerfilVoluntario({
          tipo_documento: vol.tipo_documento,
          numero_documento: vol.numero_documento,
          fecha_nacimiento: vol.fecha_nacimiento,
          genero: vol.genero,
          municipio_id: Number(vol.municipio_id),
          disponibilidad: vol.disponibilidad,
          experiencia: vol.experiencia || undefined,
          direccion: vol.direccion || undefined,
          descripcion: vol.descripcion || undefined,
          telefono_contacto: vol.telefono_contacto || undefined,
          nivel_educativo: vol.nivel_educativo || undefined,
          profesion: vol.profesion || undefined,
          idiomas: vol.idiomas || undefined,
          preferencia_modalidad: vol.preferencia_modalidad || undefined,
          contacto_emergencia_nombre: vol.contacto_emergencia_nombre || undefined,
          contacto_emergencia_telefono: vol.contacto_emergencia_telefono || undefined,
        })
        setPerfilVol(pv as PerfilVoluntario)
      }
      await refreshUsuario()
      if (!yaCompleto) {
        navigate('/app', { replace: true })
      } else {
        setOk('Perfil actualizado correctamente.')
      }
    } catch (err) {
      setError(parseApiError(err).message)
    } finally {
      setSaving(false)
    }
  }

  const muniOpts = municipios.map((m) => ({ value: m.id, label: m.nombre }))

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="h-24 animate-pulse rounded-2xl bg-ink-100 dark:bg-ink-800" />
        <div className="h-96 animate-pulse rounded-2xl bg-ink-100 dark:bg-ink-800" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-solar-400 to-solar-600 text-white shadow-glow">
          <UserCog className="size-6" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-900 dark:text-white">
            {yaCompleto ? 'Mi perfil' : 'Completa tu perfil'}
          </h1>
          <p className="text-sm text-ink-500 dark:text-ink-400">
            {yaCompleto
              ? 'Edita tu información y gestiona tu verificación.'
              : esFundacion
                ? 'Necesitamos algunos datos de tu fundación para activar todas las funciones.'
                : 'Necesitamos algunos datos tuyos para que puedas postularte a convocatorias.'}
          </p>
        </div>
      </div>

      {/* Sección de foto + verificación (solo voluntario con perfil) */}
      {!esFundacion && perfilVol && (
        <VerificacionVoluntario
          perfil={perfilVol}
          onActualizar={(p) => setPerfilVol(p)}
          onError={setError}
        />
      )}

      {!yaCompleto && (
        <Alert tone="info" className="mb-6">
          Este paso es necesario porque tu cuenta aún no tiene el perfil completo (por ejemplo, si
          te registraste con Google).
        </Alert>
      )}

      {ok && (
        <Alert tone="success" className="mb-4">
          {ok}
        </Alert>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          guardar()
        }}
        className="space-y-5 rounded-2xl border border-ink-200/60 bg-white/70 p-6 backdrop-blur dark:border-ink-700/60 dark:bg-ink-900/50"
      >
        {error && <Alert tone="error">{error}</Alert>}

        {esFundacion ? (
          <>
            <Input label="Nombre de la fundación" value={fund.nombre_fundacion} onChange={(e) => setFund({ ...fund, nombre_fundacion: e.target.value })} required />
            <Select
              label="Tipo de organización"
              options={[
                { value: 'FUNDACION', label: 'Fundación' },
                { value: 'REFUGIO', label: 'Refugio' },
                { value: 'COLECTIVO', label: 'Colectivo' },
                { value: 'INICIATIVA_CIUDADANA', label: 'Iniciativa ciudadana' },
                { value: 'OTRA', label: 'Otra' },
              ]}
              value={fund.tipo_organizacion}
              onChange={(e) => setFund({ ...fund, tipo_organizacion: e.target.value })}
            />
            <label className="flex items-center gap-2 text-sm text-ink-700 dark:text-ink-200">
              <input
                type="checkbox"
                checked={fund.constituida_legalmente}
                onChange={(e) => setFund({ ...fund, constituida_legalmente: e.target.checked })}
              />
              Estamos legalmente constituidos (NIT y documento legal). Si no, puedes participar igual.
            </label>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {fund.constituida_legalmente && (
                <Input label="NIT" placeholder="900123456-7" value={fund.nit} onChange={(e) => setFund({ ...fund, nit: e.target.value })} required />
              )}
              <Input label="Representante legal" value={fund.representante_legal} onChange={(e) => setFund({ ...fund, representante_legal: e.target.value })} required />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Teléfono de contacto" value={fund.telefono_contacto} onChange={(e) => setFund({ ...fund, telefono_contacto: e.target.value })} required />
              <Input label="Correo institucional (opcional)" type="email" value={fund.correo_institucional} onChange={(e) => setFund({ ...fund, correo_institucional: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select label="Municipio" placeholder="Selecciona" options={muniOpts} value={fund.municipio_id} onChange={(e) => setFund({ ...fund, municipio_id: e.target.value })} required />
              <Input label="Dirección" value={fund.direccion} onChange={(e) => setFund({ ...fund, direccion: e.target.value })} required />
            </div>
            {fund.constituida_legalmente && (
              <Input label="Documento legal (referencia)" placeholder="Certificado / RUT" value={fund.documento_legal} onChange={(e) => setFund({ ...fund, documento_legal: e.target.value })} required />
            )}
            <Input label="Página web (opcional)" placeholder="https://..." value={fund.pagina_web} onChange={(e) => setFund({ ...fund, pagina_web: e.target.value })} />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">Descripción</label>
              <textarea
                rows={3}
                value={fund.descripcion}
                onChange={(e) => setFund({ ...fund, descripcion: e.target.value })}
                className="w-full rounded-xl border border-ink-200 bg-white/80 px-3.5 py-2.5 text-sm text-ink-900 shadow-sm focus:border-solar-400 focus:outline-none focus:ring-2 focus:ring-solar-400/70 dark:border-ink-700 dark:bg-ink-900/60 dark:text-white"
                required
              />
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select label="Tipo de documento" placeholder="Selecciona" options={TIPO_DOC} value={vol.tipo_documento} onChange={(e) => setVol({ ...vol, tipo_documento: e.target.value })} disabled={yaCompleto} required />
              <Input label="Número de documento" value={vol.numero_documento} onChange={(e) => setVol({ ...vol, numero_documento: e.target.value })} disabled={yaCompleto} required />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Fecha de nacimiento" type="date" value={vol.fecha_nacimiento} onChange={(e) => setVol({ ...vol, fecha_nacimiento: e.target.value })} disabled={yaCompleto} required />
              <Select label="Género" placeholder="Selecciona" options={GENEROS} value={vol.genero} onChange={(e) => setVol({ ...vol, genero: e.target.value })} disabled={yaCompleto} required />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select label="Municipio" placeholder="Selecciona" options={muniOpts} value={vol.municipio_id} onChange={(e) => setVol({ ...vol, municipio_id: e.target.value })} required />
              <Select label="Disponibilidad" placeholder="Selecciona" options={DISPONIBILIDAD} value={vol.disponibilidad} onChange={(e) => setVol({ ...vol, disponibilidad: e.target.value })} required />
            </div>
            {yaCompleto && (
              <Alert tone="info">
                Tu documento, fecha de nacimiento y género no se pueden editar aquí. Si necesitas
                corregirlos, crea una solicitud en el Centro de ayuda.
              </Alert>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Dirección de residencia (opcional)" value={vol.direccion} onChange={(e) => setVol({ ...vol, direccion: e.target.value })} />
              <Input label="Teléfono de contacto (opcional)" value={vol.telefono_contacto} onChange={(e) => setVol({ ...vol, telefono_contacto: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Nivel educativo (opcional)" placeholder="Ej: Universitario" value={vol.nivel_educativo} onChange={(e) => setVol({ ...vol, nivel_educativo: e.target.value })} />
              <Input label="Profesión u ocupación (opcional)" value={vol.profesion} onChange={(e) => setVol({ ...vol, profesion: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Idiomas (opcional)" placeholder="Ej: Español, Inglés" value={vol.idiomas} onChange={(e) => setVol({ ...vol, idiomas: e.target.value })} />
              <Select
                label="Preferencia de modalidad (opcional)"
                placeholder="Selecciona"
                options={[
                  { value: 'PRESENCIAL', label: 'Presencial' },
                  { value: 'VIRTUAL', label: 'Virtual' },
                  { value: 'HIBRIDA', label: 'Híbrida' },
                  { value: 'INDIFERENTE', label: 'Indiferente' },
                ]}
                value={vol.preferencia_modalidad}
                onChange={(e) => setVol({ ...vol, preferencia_modalidad: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Contacto de emergencia (opcional)" value={vol.contacto_emergencia_nombre} onChange={(e) => setVol({ ...vol, contacto_emergencia_nombre: e.target.value })} />
              <Input label="Teléfono de emergencia (opcional)" value={vol.contacto_emergencia_telefono} onChange={(e) => setVol({ ...vol, contacto_emergencia_telefono: e.target.value })} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">Descripción personal (opcional)</label>
              <textarea
                rows={2}
                value={vol.descripcion}
                onChange={(e) => setVol({ ...vol, descripcion: e.target.value })}
                placeholder="Cuéntanos un poco sobre ti."
                className="w-full rounded-xl border border-ink-200 bg-white/80 px-3.5 py-2.5 text-sm text-ink-900 shadow-sm focus:border-solar-400 focus:outline-none focus:ring-2 focus:ring-solar-400/70 dark:border-ink-700 dark:bg-ink-900/60 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">Experiencia en voluntariado (opcional)</label>
              <textarea
                rows={3}
                value={vol.experiencia}
                onChange={(e) => setVol({ ...vol, experiencia: e.target.value })}
                placeholder="Cuéntanos sobre tu experiencia como voluntario."
                className="w-full rounded-xl border border-ink-200 bg-white/80 px-3.5 py-2.5 text-sm text-ink-900 shadow-sm focus:border-solar-400 focus:outline-none focus:ring-2 focus:ring-solar-400/70 dark:border-ink-700 dark:bg-ink-900/60 dark:text-white"
              />
            </div>
            {yaCompleto && (
              <Link
                to="/app/intereses"
                className="flex items-center justify-between rounded-xl border border-solar-300 bg-solar-50 px-4 py-3 text-sm font-medium text-solar-700 transition hover:bg-solar-100 dark:border-solar-500/40 dark:bg-solar-500/10 dark:text-solar-300"
              >
                <span>Gestionar mis intereses</span>
                <span>→</span>
              </Link>
            )}
          </>
        )}

        <Button type="submit" size="lg" fullWidth loading={saving}>
          <CheckCircle2 className="size-4" /> {yaCompleto ? 'Guardar cambios' : 'Guardar perfil'}
        </Button>
      </form>
    </div>
  )
}

/** Tarjeta de foto de perfil + verificación de documento (estilo redes sociales). */
function VerificacionVoluntario({
  perfil,
  onActualizar,
  onError,
}: {
  perfil: PerfilVoluntario
  onActualizar: (p: PerfilVoluntario) => void
  onError: (m: string) => void
}) {
  const fotoRef = useRef<HTMLInputElement>(null)
  const docRef = useRef<HTMLInputElement>(null)
  const [subiendoFoto, setSubiendoFoto] = useState(false)
  const [subiendoDoc, setSubiendoDoc] = useState(false)

  const subirFoto = async (file: File) => {
    setSubiendoFoto(true)
    onError('')
    try {
      const url = await convocatoriaService.subirFotoVoluntario(file)
      onActualizar({ ...perfil, foto_perfil: url })
    } catch (err) {
      onError(parseApiError(err).message)
    } finally {
      setSubiendoFoto(false)
    }
  }

  const subirDoc = async (file: File) => {
    setSubiendoDoc(true)
    onError('')
    try {
      const url = await convocatoriaService.subirDocumentoVoluntario(file)
      onActualizar({ ...perfil, documento_identidad: url, esta_verificado: false })
    } catch (err) {
      onError(parseApiError(err).message)
    } finally {
      setSubiendoDoc(false)
    }
  }

  return (
    <div className="mb-6 rounded-2xl border border-ink-200/60 bg-white/70 p-6 backdrop-blur dark:border-ink-700/60 dark:bg-ink-900/50">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        {/* Foto */}
        <div className="relative">
          <div className="flex size-24 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-solar-200 to-solar-400 text-white">
            {perfil.foto_perfil ? (
              <img src={perfil.foto_perfil} alt="Foto de perfil" className="size-full object-cover" />
            ) : (
              <UserCog className="size-10" />
            )}
          </div>
          <button
            type="button"
            onClick={() => fotoRef.current?.click()}
            disabled={subiendoFoto}
            className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full bg-solar-500 text-white shadow-md hover:bg-solar-600 disabled:opacity-50"
            title="Cambiar foto"
          >
            <Camera className="size-4" />
          </button>
          <input
            ref={fotoRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => e.target.files?.[0] && subirFoto(e.target.files[0])}
          />
        </div>

        {/* Estado de verificación */}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center gap-2 sm:justify-start">
            <h3 className="font-semibold text-ink-900 dark:text-white">Verificación de identidad</h3>
            {perfil.esta_verificado ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
                <BadgeCheck className="size-3.5" /> Verificado
              </span>
            ) : perfil.documento_identidad ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                <Clock className="size-3.5" /> En revisión
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-ink-200 px-2 py-0.5 text-xs font-semibold text-ink-600 dark:bg-ink-700 dark:text-ink-300">
                Sin verificar
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
            {perfil.esta_verificado
              ? 'Tu identidad ha sido verificada por el equipo de Solari.'
              : perfil.documento_identidad
                ? 'Recibimos tu documento. Un administrador lo revisará pronto.'
                : 'Sube tu documento de identidad para obtener la insignia de verificado.'}
          </p>

          <button
            type="button"
            onClick={() => docRef.current?.click()}
            disabled={subiendoDoc}
            className="mt-3 inline-flex items-center gap-2 rounded-xl border border-solar-300 bg-solar-50 px-4 py-2 text-sm font-semibold text-solar-700 transition hover:bg-solar-100 disabled:opacity-50 dark:border-solar-500/40 dark:bg-solar-500/10 dark:text-solar-300"
          >
            {subiendoDoc ? (
              <>Subiendo…</>
            ) : perfil.documento_identidad ? (
              <>
                <Upload className="size-4" /> Reemplazar documento
              </>
            ) : (
              <>
                <ShieldCheck className="size-4" /> Subir documento de identidad
              </>
            )}
          </button>
          {perfil.documento_identidad && (
            <button
              type="button"
              onClick={() => abrirArchivoPrivado(perfil.documento_identidad as string)}
              className="mt-2 flex items-center justify-center gap-1 text-xs text-ink-400 hover:text-solar-500 sm:justify-start"
            >
              <FileText className="size-3.5" /> Ver documento subido
            </button>
          )}
          <input
            ref={docRef}
            type="file"
            accept="image/*,application/pdf"
            hidden
            onChange={(e) => e.target.files?.[0] && subirDoc(e.target.files[0])}
          />
        </div>
      </div>
    </div>
  )
}
