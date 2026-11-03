import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, UserCog } from 'lucide-react'

import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useAuth } from '@/auth/AuthContext'
import { parseApiError } from '@/lib/apiClient'
import { convocatoriaService } from '@/services/convocatoriaService'
import type { Municipio } from '@/types/convocatoria'

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
  const [saving, setSaving] = useState(false)

  const [vol, setVol] = useState({
    tipo_documento: '',
    numero_documento: '',
    fecha_nacimiento: '',
    genero: '',
    municipio_id: '',
    disponibilidad: '',
    experiencia: '',
  })
  const [fund, setFund] = useState({
    nombre_fundacion: '',
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
    convocatoriaService.municipios().then(setMunicipios).catch(() => {})
  }, [])

  const guardar = async () => {
    setError(null)
    setSaving(true)
    try {
      if (esFundacion) {
        await convocatoriaService.guardarPerfilFundacion({
          nombre_fundacion: fund.nombre_fundacion,
          nit: fund.nit,
          representante_legal: fund.representante_legal,
          correo_institucional: fund.correo_institucional || undefined,
          telefono_contacto: fund.telefono_contacto,
          direccion: fund.direccion,
          municipio_id: Number(fund.municipio_id),
          descripcion: fund.descripcion,
          documento_legal: fund.documento_legal,
          pagina_web: fund.pagina_web || undefined,
        })
      } else {
        await convocatoriaService.guardarPerfilVoluntario({
          tipo_documento: vol.tipo_documento,
          numero_documento: vol.numero_documento,
          fecha_nacimiento: vol.fecha_nacimiento,
          genero: vol.genero,
          municipio_id: Number(vol.municipio_id),
          disponibilidad: vol.disponibilidad,
          experiencia: vol.experiencia || undefined,
        })
      }
      await refreshUsuario()
      navigate('/app', { replace: true })
    } catch (err) {
      setError(parseApiError(err).message)
    } finally {
      setSaving(false)
    }
  }

  const muniOpts = municipios.map((m) => ({ value: m.id, label: m.nombre }))

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-solar-400 to-solar-600 text-white shadow-glow">
          <UserCog className="size-6" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-900 dark:text-white">
            Completa tu perfil
          </h1>
          <p className="text-sm text-ink-500 dark:text-ink-400">
            {esFundacion
              ? 'Necesitamos algunos datos de tu fundación para activar todas las funciones.'
              : 'Necesitamos algunos datos tuyos para que puedas postularte a convocatorias.'}
          </p>
        </div>
      </div>

      <Alert tone="info" className="mb-6">
        Este paso es necesario porque tu cuenta aún no tiene el perfil completo (por ejemplo, si te
        registraste con Google).
      </Alert>

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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="NIT" placeholder="900123456-7" value={fund.nit} onChange={(e) => setFund({ ...fund, nit: e.target.value })} required />
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
            <Input label="Documento legal (referencia)" placeholder="Certificado / RUT" value={fund.documento_legal} onChange={(e) => setFund({ ...fund, documento_legal: e.target.value })} required />
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
              <Select label="Tipo de documento" placeholder="Selecciona" options={TIPO_DOC} value={vol.tipo_documento} onChange={(e) => setVol({ ...vol, tipo_documento: e.target.value })} required />
              <Input label="Número de documento" value={vol.numero_documento} onChange={(e) => setVol({ ...vol, numero_documento: e.target.value })} required />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Fecha de nacimiento" type="date" value={vol.fecha_nacimiento} onChange={(e) => setVol({ ...vol, fecha_nacimiento: e.target.value })} required />
              <Select label="Género" placeholder="Selecciona" options={GENEROS} value={vol.genero} onChange={(e) => setVol({ ...vol, genero: e.target.value })} required />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select label="Municipio" placeholder="Selecciona" options={muniOpts} value={vol.municipio_id} onChange={(e) => setVol({ ...vol, municipio_id: e.target.value })} required />
              <Select label="Disponibilidad" placeholder="Selecciona" options={DISPONIBILIDAD} value={vol.disponibilidad} onChange={(e) => setVol({ ...vol, disponibilidad: e.target.value })} required />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">Experiencia (opcional)</label>
              <textarea
                rows={3}
                value={vol.experiencia}
                onChange={(e) => setVol({ ...vol, experiencia: e.target.value })}
                placeholder="Cuéntanos sobre tu experiencia como voluntario."
                className="w-full rounded-xl border border-ink-200 bg-white/80 px-3.5 py-2.5 text-sm text-ink-900 shadow-sm focus:border-solar-400 focus:outline-none focus:ring-2 focus:ring-solar-400/70 dark:border-ink-700 dark:bg-ink-900/60 dark:text-white"
              />
            </div>
          </>
        )}

        <Button type="submit" size="lg" fullWidth loading={saving}>
          <CheckCircle2 className="size-4" /> Guardar perfil
        </Button>
      </form>
    </div>
  )
}
