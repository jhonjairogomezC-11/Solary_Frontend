import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Lock, Mail, User } from 'lucide-react'

import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { disponibilidadOptions, generoOptions, tipoDocumentoOptions } from '@/lib/catalogs'
import { useMunicipios } from '@/hooks/useMunicipios'
import {
  EDAD_MINIMA,
  fechaMaximaNacimiento,
  volunteerSchema,
  type VolunteerForm as VForm,
} from '@/lib/validators'
import type { RegisterVolunteerPayload, TokenResponse } from '@/types/auth'
import { authService } from '@/services/authService'
import { parseApiError } from '@/lib/apiClient'

interface Props {
  onSuccess: (data: TokenResponse) => void
  serverError: string | null
  setServerError: (msg: string | null) => void
}

export function VolunteerForm({ onSuccess, serverError, setServerError }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VForm>({ resolver: zodResolver(volunteerSchema) })
  const municipios = useMunicipios()

  const onSubmit = async (values: VForm) => {
    setServerError(null)
    const payload: RegisterVolunteerPayload = {
      nombre: values.nombre,
      email: values.email,
      password: values.password,
      password_confirmation: values.password_confirmation,
      telefono: values.telefono || undefined,
      tipo_documento: values.tipo_documento,
      numero_documento: values.numero_documento,
      fecha_nacimiento: values.fecha_nacimiento,
      genero: values.genero,
      municipio_id: values.municipio_id,
      disponibilidad: values.disponibilidad,
      experiencia: values.experiencia || undefined,
    }
    try {
      const data = await authService.registerVolunteer(payload)
      onSuccess(data)
    } catch (err) {
      setServerError(parseApiError(err).message)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {serverError && <Alert tone="error">{serverError}</Alert>}

      <Input
        label="Nombre completo"
        icon={<User className="size-4.5" />}
        placeholder="Ana Pérez"
        error={errors.nombre?.message}
        {...register('nombre')}
      />
      <Input
        label="Correo electrónico"
        type="email"
        autoComplete="email"
        icon={<Mail className="size-4.5" />}
        placeholder="tu@correo.com"
        error={errors.email?.message}
        {...register('email')}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Contraseña"
          type="password"
          autoComplete="new-password"
          icon={<Lock className="size-4.5" />}
          hint="Mín. 8, con mayúscula, minúscula y número."
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          label="Confirmar contraseña"
          type="password"
          autoComplete="new-password"
          icon={<Lock className="size-4.5" />}
          error={errors.password_confirmation?.message}
          {...register('password_confirmation')}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          label="Tipo de documento"
          placeholder="Selecciona"
          options={tipoDocumentoOptions}
          error={errors.tipo_documento?.message}
          {...register('tipo_documento')}
        />
        <Input
          label="Número de documento"
          placeholder="1234567890"
          error={errors.numero_documento?.message}
          {...register('numero_documento')}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Fecha de nacimiento"
          type="date"
          max={fechaMaximaNacimiento()}
          hint={`Edad mínima: ${EDAD_MINIMA} años. Si tienes 16 o 17, tu acudiente debe autorizarte.`}
          error={errors.fecha_nacimiento?.message}
          {...register('fecha_nacimiento')}
        />
        <Select
          label="Género"
          placeholder="Selecciona"
          options={generoOptions}
          error={errors.genero?.message}
          {...register('genero')}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          label="Municipio"
          placeholder={municipios.loading ? 'Cargando…' : 'Selecciona'}
          options={municipios.options}
          error={
            errors.municipio_id?.message ??
            (municipios.error ? 'No se pudieron cargar los municipios.' : undefined)
          }
          {...register('municipio_id')}
        />
        <Select
          label="Disponibilidad"
          placeholder="Selecciona"
          options={disponibilidadOptions}
          error={errors.disponibilidad?.message}
          {...register('disponibilidad')}
        />
      </div>

      <Input
        label="Teléfono (opcional)"
        placeholder="+57 300 000 0000"
        error={errors.telefono?.message}
        {...register('telefono')}
      />

      <Checkbox
        label={
          <>
            Acepto los{' '}
            <a href="#" className="font-medium text-solar-600 hover:underline dark:text-solar-400">
              términos y condiciones
            </a>{' '}
            y la política de tratamiento de datos.
          </>
        }
        error={errors.acepta_terminos?.message}
        {...register('acepta_terminos')}
      />

      <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
        Crear cuenta de voluntario
      </Button>
    </form>
  )
}
