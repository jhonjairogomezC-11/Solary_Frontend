import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, Clock, Download, FileText, ShieldAlert, Upload, Users, XCircle } from 'lucide-react'

import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { parseApiError } from '@/lib/apiClient'
import { abrirArchivoPrivado } from '@/lib/archivos'
import { formatDate } from '@/lib/utils'
import {
  menoresService,
  PARENTESCOS,
  type AutorizacionAcudiente as Autorizacion,
  type Parentesco,
} from '@/services/menoresService'

function EstadoBadge({ estado }: { estado: Autorizacion['estado'] }) {
  if (estado === 'APROBADA') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
        <CheckCircle2 className="size-3.5" /> Aprobada
      </span>
    )
  }
  if (estado === 'PENDIENTE') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
        <Clock className="size-3.5" /> En revisión
      </span>
    )
  }
  if (estado === 'RECHAZADA') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-500/15 dark:text-red-300">
        <XCircle className="size-3.5" /> Rechazada
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-ink-200 px-2 py-0.5 text-xs font-semibold text-ink-600 dark:bg-ink-700 dark:text-ink-300">
      Sin enviar
    </span>
  )
}

/**
 * Sección "Autorización del acudiente" del perfil. Solo se muestra a menores de edad:
 * datos del acudiente, formato PDF para firmar, subida del archivo firmado y estado.
 */
export function AutorizacionAcudiente() {
  const [aut, setAut] = useState<Autorizacion | null>(null)
  const [form, setForm] = useState({
    acudiente_nombre: '',
    acudiente_documento: '',
    acudiente_telefono: '',
    acudiente_parentesco: '' as Parentesco | '',
  })
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [subiendo, setSubiendo] = useState(false)
  const [descargando, setDescargando] = useState(false)
  const archivoRef = useRef<HTMLInputElement>(null)

  const aplicar = (a: Autorizacion) => {
    setAut(a)
    setForm({
      acudiente_nombre: a.acudiente_nombre ?? '',
      acudiente_documento: a.acudiente_documento ?? '',
      acudiente_telefono: a.acudiente_telefono ?? '',
      acudiente_parentesco: a.acudiente_parentesco ?? '',
    })
  }

  useEffect(() => {
    let activo = true
    menoresService
      .estado()
      .then((a) => activo && aplicar(a))
      .catch(() => {
        // Sin perfil o error de red: la sección simplemente no se muestra.
      })
    return () => {
      activo = false
    }
  }, [])

  if (!aut || !aut.requerida) return null

  const datosGuardados = Boolean(aut.acudiente_nombre && aut.acudiente_documento && aut.acudiente_telefono)
  const aprobada = aut.estado === 'APROBADA'

  const guardar = async () => {
    if (!form.acudiente_parentesco) {
      setError('Selecciona el parentesco del acudiente.')
      return
    }
    setError(null)
    setOk(null)
    setGuardando(true)
    try {
      aplicar(
        await menoresService.guardarAcudiente({
          ...form,
          acudiente_parentesco: form.acudiente_parentesco,
        }),
      )
      setOk('Datos del acudiente guardados.')
    } catch (err) {
      setError(parseApiError(err).message)
    } finally {
      setGuardando(false)
    }
  }

  const descargar = async () => {
    setError(null)
    setDescargando(true)
    try {
      await menoresService.descargarFormato()
    } catch (err) {
      setError(parseApiError(err).message)
    } finally {
      setDescargando(false)
    }
  }

  const subir = async (file: File) => {
    setError(null)
    setOk(null)
    setSubiendo(true)
    try {
      aplicar(await menoresService.subirAutorizacion(file))
      setOk('Recibimos la autorización. Un administrador la revisará pronto.')
    } catch (err) {
      setError(parseApiError(err).message)
    } finally {
      setSubiendo(false)
      if (archivoRef.current) archivoRef.current.value = ''
    }
  }

  return (
    <section className="mb-6 space-y-4 rounded-2xl border border-amber-300/70 bg-white/70 p-6 backdrop-blur dark:border-amber-500/30 dark:bg-ink-900/50">
      <div className="flex flex-wrap items-center gap-2">
        <Users className="size-5 text-amber-600 dark:text-amber-400" />
        <h3 className="font-semibold text-ink-900 dark:text-white">Autorización del acudiente</h3>
        <EstadoBadge estado={aut.estado} />
      </div>
      <p className="text-sm text-ink-500 dark:text-ink-400">
        Como tienes {aut.edad} años, necesitas la autorización de tu madre, padre o representante
        legal. Puedes postularte desde ya, pero las organizaciones solo podrán aceptarte cuando el
        equipo de Solari apruebe la autorización.
      </p>

      {aut.estado === 'RECHAZADA' && aut.nota && (
        <Alert tone="error">
          <strong>Nota del administrador:</strong> {aut.nota}
        </Alert>
      )}
      {aut.estado !== 'RECHAZADA' && aut.nota && <Alert tone="info">{aut.nota}</Alert>}
      {aprobada && (
        <Alert tone="success">
          Tu autorización fue aprobada{aut.fecha ? ` el ${formatDate(aut.fecha)}` : ''}.
        </Alert>
      )}
      {error && <Alert tone="error">{error}</Alert>}
      {ok && <Alert tone="success">{ok}</Alert>}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          void guardar()
        }}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Nombre completo del acudiente"
            value={form.acudiente_nombre}
            onChange={(e) => setForm({ ...form, acudiente_nombre: e.target.value })}
            maxLength={150}
            required
          />
          <Select
            label="Parentesco"
            placeholder="Selecciona"
            options={PARENTESCOS}
            value={form.acudiente_parentesco}
            onChange={(e) =>
              setForm({ ...form, acudiente_parentesco: e.target.value as Parentesco })
            }
            required
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Documento del acudiente"
            value={form.acudiente_documento}
            onChange={(e) => setForm({ ...form, acudiente_documento: e.target.value })}
            maxLength={20}
            required
          />
          <Input
            label="Teléfono del acudiente"
            type="tel"
            value={form.acudiente_telefono}
            onChange={(e) => setForm({ ...form, acudiente_telefono: e.target.value })}
            maxLength={20}
            required
          />
        </div>
        {aprobada && (
          <p className="text-xs text-ink-400">
            Si cambias el nombre o el documento del acudiente, tendrás que subir una nueva
            autorización firmada.
          </p>
        )}
        <Button type="submit" variant="outline" loading={guardando}>
          Guardar datos del acudiente
        </Button>
      </form>

      <div className="flex flex-wrap gap-2 border-t border-ink-200/60 pt-4 dark:border-ink-700/60">
        <Button type="button" variant="outline" onClick={descargar} loading={descargando}>
          <Download className="size-4" /> Descargar formato
        </Button>
        {!aprobada && (
          <Button
            type="button"
            onClick={() => archivoRef.current?.click()}
            loading={subiendo}
            disabled={!datosGuardados}
            title={datosGuardados ? undefined : 'Primero guarda los datos del acudiente'}
          >
            <Upload className="size-4" />
            {aut.archivo ? 'Reemplazar autorización firmada' : 'Subir autorización firmada'}
          </Button>
        )}
        {aut.archivo && (
          <button
            type="button"
            onClick={() => abrirArchivoPrivado(aut.archivo as string).catch(() => setError('No se pudo abrir el archivo.'))}
            className="inline-flex items-center gap-1 px-2 text-sm text-ink-500 hover:text-solar-600 dark:text-ink-400"
          >
            <FileText className="size-4" /> Ver archivo enviado
          </button>
        )}
        <input
          ref={archivoRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          hidden
          onChange={(e) => e.target.files?.[0] && subir(e.target.files[0])}
        />
      </div>
      <p className="flex items-start gap-1.5 text-xs text-ink-400">
        <ShieldAlert className="mt-0.5 size-3.5 shrink-0" />
        El archivo es privado: solo tú y el equipo de administración de Solari pueden verlo
        (Ley 1581 de 2012). Acepta PDF o imagen (JPG, PNG o WEBP).
      </p>
    </section>
  )
}
