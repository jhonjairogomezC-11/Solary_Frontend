import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, Lock, Mail, User } from 'lucide-react'

import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { municipioOptions } from '@/lib/catalogs'
import { foundationSchema, type FoundationForm as FForm } from '@/lib/validators'
import type { RegisterFoundationPayload, TokenResponse } from '@/types/auth'
import { authService } from '@/services/authService'
import { parseApiError } from '@/lib/apiClient'

interface Props {
  onSuccess: (data: TokenResponse) => void
  serverError: string | null
  setServerError: (msg: string | null) => void
}

export function FoundationForm({ onSuccess, serverError, setServerError }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FForm>({ resolver: zodResolver(foundationSchema) })

  const onSubmit = async (values: FForm) => {
    setServerError(null)
    const payload: RegisterFoundationPayload = {
      nombre: values.nombre,
      email: values.email,
      password: values.password,
      password_confirmation: values.password_confirmation,
      telefono: values.telefono || undefined,
      nombre_fundacion: values.nombre_fundacion,
      nit: values.nit,
      representante_legal: values.representante_legal,
      correo_institucional: values.correo_institucional || undefined,
      telefono_contacto: values.telefono_contacto,
      direccion: values.direccion,
      municipio_id: values.municipio_id,
      descripcion: values.descripcion,
      documento_legal: values.documento_legal,
      pagina_web: values.pagina_web || undefined,
    }
    try {
      const data = await authService.registerFoundation(payload)
      onSuccess(data)
    } catch (err) {
      setServerError(parseApiError(err).message)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {serverError && <Alert tone="error">{serverError}</Alert>}

      <Input
        label="Nombre de la fundación"
        icon={<Building2 className="size-4.5" />}
        placeholder="Fundación Sonrisas"
        error={errors.nombre_fundacion?.message}
        {...register('nombre_fundacion')}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="NIT"
          placeholder="900123456-7"
          error={errors.nit?.message}
          {...register('nit')}
        />
        <Input
          label="Representante legal"
          icon={<User className="size-4.5" />}
          placeholder="Nombre del responsable"
          error={errors.representante_legal?.message}
          {...register('representante_legal')}
        />
      </div>

      <Input
        label="Nombre de contacto"
        icon={<User className="size-4.5" />}
        placeholder="Persona de contacto"
        error={errors.nombre?.message}
        {...register('nombre')}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Correo de acceso"
          type="email"
          autoComplete="email"
          icon={<Mail className="size-4.5" />}
          placeholder="acceso@fundacion.org"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Correo institucional (opcional)"
          type="email"
          icon={<Mail className="size-4.5" />}
          placeholder="info@fundacion.org"
          error={errors.correo_institucional?.message}
          {...register('correo_institucional')}
        />
      </div>

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
        <Input
          label="Teléfono de contacto"
          placeholder="+57 300 000 0000"
          error={errors.telefono_contacto?.message}
          {...register('telefono_contacto')}
        />
        <Select
          label="Municipio"
          placeholder="Selecciona"
          options={municipioOptions}
          error={errors.municipio_id?.message}
          {...register('municipio_id')}
        />
      </div>

      <Input
        label="Dirección"
        placeholder="Calle 123 # 45-67"
        error={errors.direccion?.message}
        {...register('direccion')}
      />

      <Input
        label="Documento legal (referencia)"
        placeholder="Certificado de existencia / RUT"
        hint="Referencia del documento que acredita a la fundación."
        error={errors.documento_legal?.message}
        {...register('documento_legal')}
      />

      <Input
        label="Página web (opcional)"
        placeholder="https://fundacion.org"
        error={errors.pagina_web?.message}
        {...register('pagina_web')}
      />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-ink-200">
          Descripción
        </label>
        <textarea
          rows={3}
          placeholder="Cuéntanos qué hace tu fundación y a quién ayuda."
          className="w-full rounded-xl border border-ink-200 bg-white/80 px-3.5 py-2.5 text-sm text-ink-900 shadow-sm backdrop-blur transition placeholder:text-ink-400 focus:border-solar-400 focus:outline-none focus:ring-2 focus:ring-solar-400/70 dark:border-ink-700 dark:bg-ink-900/60 dark:text-white"
          {...register('descripcion')}
        />
        {errors.descripcion && (
          <p className="mt-1.5 text-xs font-medium text-red-500">{errors.descripcion.message}</p>
        )}
      </div>

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
        Registrar fundación
      </Button>
    </form>
  )
}
