import { useEffect, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

import { PasosRegistro, SessionBar } from '@/components/auth/OnboardingChrome'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useAuth } from '@/auth/AuthContext'
import { parseApiError } from '@/lib/apiClient'
import { convocatoriaService } from '@/services/convocatoriaService'
import type { PerfilVoluntario } from '@/types/convocatoria'

export interface OnboardingContext {
  marcarPerfilCompleto: () => void
}

const REGEX_TEL = /^[0-9+\s-]{7,20}$/

const MODALIDADES = [
  { value: 'PRESENCIAL', label: 'Presencial' },
  { value: 'VIRTUAL', label: 'Virtual' },
  { value: 'HIBRIDA', label: 'Híbrida' },
  { value: 'INDIFERENTE', label: 'Indiferente' },
]

/**
 * Paso intermedio para voluntarios: después de confirmar el correo completan los datos
 * obligatorios del perfil (teléfono, dirección y contacto de emergencia) antes de entrar.
 */
export function OnboardingPerfilPage() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const { marcarPerfilCompleto } = useOutletContext<OnboardingContext>()

  const [perfil, setPerfil] = useState<PerfilVoluntario | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [f, setF] = useState({
    telefono_contacto: '',
    direccion: '',
    nivel_educativo: '',
    profesion: '',
    idiomas: '',
    preferencia_modalidad: '',
    contacto_emergencia_nombre: '',
    contacto_emergencia_telefono: '',
  })

  useEffect(() => {
    let active = true
    convocatoriaService
      .miPerfilVoluntario()
      .then((p) => {
        if (!active) return
        if (p) {
          setPerfil(p)
          setF({
            telefono_contacto: p.telefono_contacto ?? usuario?.telefono ?? '',
            direccion: p.direccion ?? '',
            nivel_educativo: p.nivel_educativo ?? '',
            profesion: p.profesion ?? '',
            idiomas: p.idiomas ?? '',
            preferencia_modalidad: p.preferencia_modalidad ?? '',
            contacto_emergencia_nombre: p.contacto_emergencia_nombre ?? '',
            contacto_emergencia_telefono: p.contacto_emergencia_telefono ?? '',
          })
        } else {
          navigate('/app/perfil', { replace: true })
        }
      })
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF((prev) => ({ ...prev, [k]: e.target.value }))

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!perfil) return
    const nuevos: Record<string, string> = {}
    if (!REGEX_TEL.test(f.telefono_contacto.trim())) {
      nuevos.telefono_contacto = 'Ingresa un teléfono válido (7 a 20 dígitos).'
    }
    if (f.direccion.trim().length < 4) {
      nuevos.direccion = 'Ingresa tu dirección de residencia.'
    }
    if (f.contacto_emergencia_nombre.trim().length < 3) {
      nuevos.contacto_emergencia_nombre = 'Indica el nombre de tu contacto de emergencia.'
    }
    if (!REGEX_TEL.test(f.contacto_emergencia_telefono.trim())) {
      nuevos.contacto_emergencia_telefono = 'Ingresa un teléfono válido (7 a 20 dígitos).'
    }
    setErrores(nuevos)
    if (Object.keys(nuevos).length > 0) {
      setError('Revisa los campos marcados en rojo para continuar.')
      return
    }
    setError(null)
    setSaving(true)
    try {
      await convocatoriaService.guardarPerfilVoluntario({
        // Datos de identidad: se reenvían sin cambios (no son editables).
        tipo_documento: perfil.tipo_documento,
        numero_documento: perfil.numero_documento,
        fecha_nacimiento: perfil.fecha_nacimiento,
        genero: perfil.genero,
        municipio_id: perfil.municipio_id,
        disponibilidad: perfil.disponibilidad,
        experiencia: perfil.experiencia || undefined,
        descripcion: perfil.descripcion || undefined,
        telefono_contacto: f.telefono_contacto.trim(),
        direccion: f.direccion.trim(),
        nivel_educativo: f.nivel_educativo.trim() || undefined,
        profesion: f.profesion.trim() || undefined,
        idiomas: f.idiomas.trim() || undefined,
        preferencia_modalidad: f.preferencia_modalidad || undefined,
        contacto_emergencia_nombre: f.contacto_emergencia_nombre.trim(),
        contacto_emergencia_telefono: f.contacto_emergencia_telefono.trim(),
      })
      marcarPerfilCompleto()
      navigate('/app', { replace: true })
    } catch (err) {
      setError(parseApiError(err).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <AuthLayout
      title="Completa tu perfil"
      subtitle="Correo confirmado. Falta este último paso para entrar a Solari."
    >
      <SessionBar />
      <PasosRegistro actual={2} />
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-8 animate-spin text-solar-500" />
        </div>
      ) : (
        <form onSubmit={guardar} className="space-y-4" noValidate>
          {error && <Alert tone="error">{error}</Alert>}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Teléfono de contacto"
              placeholder="+57 300 000 0000"
              autoComplete="tel"
              value={f.telefono_contacto}
              onChange={set('telefono_contacto')}
              error={errores.telefono_contacto}
            />
            <Input
              label="Dirección de residencia"
              placeholder="Calle 10 # 5-20"
              autoComplete="street-address"
              value={f.direccion}
              onChange={set('direccion')}
              error={errores.direccion}
            />
            <Input
              label="Nombre del contacto de emergencia"
              placeholder="Nombre y apellido"
              value={f.contacto_emergencia_nombre}
              onChange={set('contacto_emergencia_nombre')}
              error={errores.contacto_emergencia_nombre}
            />
            <Input
              label="Teléfono del contacto de emergencia"
              placeholder="+57 300 000 0000"
              value={f.contacto_emergencia_telefono}
              onChange={set('contacto_emergencia_telefono')}
              error={errores.contacto_emergencia_telefono}
            />
          </div>

          <p className="pt-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
            Opcional, puedes completarlo después
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Nivel educativo"
              placeholder="Ej: Universitario"
              value={f.nivel_educativo}
              onChange={set('nivel_educativo')}
            />
            <Input label="Profesión u ocupación" value={f.profesion} onChange={set('profesion')} />
            <Input
              label="Idiomas"
              placeholder="Ej: Español, Inglés"
              value={f.idiomas}
              onChange={set('idiomas')}
            />
            <Select
              label="Preferencia de modalidad"
              placeholder="Selecciona"
              options={MODALIDADES}
              value={f.preferencia_modalidad}
              onChange={set('preferencia_modalidad')}
            />
          </div>

          <Button type="submit" size="lg" fullWidth loading={saving}>
            Guardar y entrar a Solari
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
