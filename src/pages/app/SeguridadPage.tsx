import { useCallback, useEffect, useState } from 'react'
import { KeyRound, Loader2, LogOut, Monitor, ShieldCheck, Smartphone } from 'lucide-react'

import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { parseApiError } from '@/lib/apiClient'
import { seguridadService, type MfaEstado, type MfaInicio, type Sesion } from '@/services/seguridadService'

type Msg = { tone: 'success' | 'error'; text: string } | null

function fechaHora(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })
}

function esMovil(dispositivo: string) {
  return /android|iphone|ipad|móvil|movil|mobile/i.test(dispositivo)
}

function Tarjeta({ titulo, descripcion, children }: { titulo: string; descripcion: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-ink-200 bg-white/70 p-6 shadow-sm dark:border-ink-700 dark:bg-ink-900/40">
      <header className="mb-5 border-b border-ink-100 pb-4 dark:border-ink-800">
        <h2 className="font-display text-lg font-bold text-ink-900 dark:text-white">{titulo}</h2>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">{descripcion}</p>
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

export function SeguridadPage() {
  const [sesiones, setSesiones] = useState<Sesion[]>([])
  const [mfa, setMfa] = useState<MfaEstado | null>(null)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState<Msg>(null)
  const [ocupado, setOcupado] = useState<string | null>(null)

  const [inicio, setInicio] = useState<MfaInicio | null>(null)
  const [codigo, setCodigo] = useState('')
  const [respaldo, setRespaldo] = useState<string[] | null>(null)
  const [desactivar, setDesactivar] = useState({ abierto: false, codigo: '', password: '' })

  const cargar = useCallback(async () => {
    const [s, m] = await Promise.all([seguridadService.sesiones(), seguridadService.mfaEstado()])
    setSesiones(s)
    setMfa(m)
  }, [])

  useEffect(() => {
    let active = true
    Promise.all([seguridadService.sesiones(), seguridadService.mfaEstado()])
      .then(([s, m]) => {
        if (!active) return
        setSesiones(s)
        setMfa(m)
      })
      .catch((e) => active && setMsg({ tone: 'error', text: parseApiError(e).message }))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const run = async (clave: string, fn: () => Promise<string | void>) => {
    setMsg(null)
    setOcupado(clave)
    try {
      const ok = await fn()
      await cargar()
      if (ok) setMsg({ tone: 'success', text: ok })
    } catch (e) {
      setMsg({ tone: 'error', text: parseApiError(e).message })
    } finally {
      setOcupado(null)
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="size-8 animate-spin text-solar-500" />
      </div>
    )

  const otras = sesiones.filter((s) => !s.actual).length

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink-900 dark:text-white">
          Seguridad de la cuenta
        </h1>
        <p className="mt-1 text-ink-500 dark:text-ink-400">
          Revisa dónde tienes la sesión abierta y protege tu cuenta con un segundo paso.
        </p>
      </div>
      {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}

      <Tarjeta
        titulo="Verificación en dos pasos"
        descripcion="Además de tu contraseña, al iniciar sesión se pedirá un código de 6 dígitos de una app autenticadora (Google Authenticator, Microsoft Authenticator, Authy…)."
      >
        <div className="flex flex-wrap items-center gap-2">
          <ShieldCheck className={`size-5 ${mfa?.activo ? 'text-green-600' : 'text-ink-400'}`} />
          <span className="text-sm font-semibold text-ink-800 dark:text-ink-100">
            {mfa?.activo ? 'Activada' : 'Desactivada'}
          </span>
          {mfa?.activo && (
            <Badge tone="gray">{mfa.codigos_respaldo_restantes} códigos de respaldo disponibles</Badge>
          )}
        </div>
        {!mfa?.activo && mfa?.recomendado && (
          <Alert tone="info">Te recomendamos activarla: tu cuenta tiene permisos de administración.</Alert>
        )}

        {respaldo && (
          <Alert tone="success">
            <p className="font-semibold">Guarda estos códigos de respaldo en un lugar seguro.</p>
            <p className="mt-1 text-sm">
              Cada uno sirve una sola vez si pierdes el celular. No se volverán a mostrar.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-sm sm:grid-cols-4">
              {respaldo.map((c) => (
                <span key={c} className="rounded-lg bg-white/80 px-2 py-1 text-center dark:bg-ink-900/60">
                  {c}
                </span>
              ))}
            </div>
          </Alert>
        )}

        {!mfa?.activo && !inicio && (
          <Button
            loading={ocupado === 'iniciar'}
            onClick={() =>
              run('iniciar', async () => {
                setRespaldo(null)
                setInicio(await seguridadService.mfaIniciar())
              })
            }
          >
            <KeyRound className="size-4" /> Activar verificación en dos pasos
          </Button>
        )}

        {!mfa?.activo && inicio && (
          <div className="space-y-4 rounded-xl bg-ink-50/70 p-4 dark:bg-ink-800/30">
            <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">
              1. Escanea el código con tu app autenticadora
            </p>
            <img src={inicio.qr_svg} alt="Código QR para la app autenticadora" className="size-44 rounded-lg bg-white p-2" />
            <p className="text-xs text-ink-500">
              ¿No puedes escanear? Ingresa esta clave manualmente:{' '}
              <span className="break-all font-mono font-semibold text-ink-800 dark:text-ink-100">{inicio.secreto}</span>
            </p>
            <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">2. Escribe el código que aparece</p>
            <div className="flex flex-wrap items-end gap-2">
              <div className="w-40">
                <Input
                  label="Código"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
                />
              </div>
              <Button
                disabled={codigo.length !== 6}
                loading={ocupado === 'confirmar'}
                onClick={() =>
                  run('confirmar', async () => {
                    const r = await seguridadService.mfaConfirmar(codigo)
                    setRespaldo(r.codigos_respaldo)
                    setInicio(null)
                    setCodigo('')
                    return r.message
                  })
                }
              >
                Confirmar
              </Button>
              <Button variant="ghost" onClick={() => { setInicio(null); setCodigo('') }}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {mfa?.activo && !desactivar.abierto && (
          <Button variant="outline" onClick={() => setDesactivar({ abierto: true, codigo: '', password: '' })}>
            Desactivar
          </Button>
        )}
        {mfa?.activo && desactivar.abierto && (
          <div className="space-y-3 rounded-xl bg-ink-50/70 p-4 dark:bg-ink-800/30">
            <p className="text-sm text-ink-700 dark:text-ink-200">
              Para desactivarla confirma con un código de tu app (o uno de respaldo) y tu contraseña.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Código"
                value={desactivar.codigo}
                onChange={(e) => setDesactivar({ ...desactivar, codigo: e.target.value.trim() })}
              />
              <Input
                label="Contraseña"
                type="password"
                hint="Si entraste con Google, déjala vacía."
                value={desactivar.password}
                onChange={(e) => setDesactivar({ ...desactivar, password: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="text-red-600"
                disabled={desactivar.codigo.length < 6}
                loading={ocupado === 'desactivar'}
                onClick={() =>
                  run('desactivar', async () => {
                    const r = await seguridadService.mfaDesactivar({
                      codigo: desactivar.codigo,
                      ...(desactivar.password ? { password: desactivar.password } : {}),
                    })
                    setDesactivar({ abierto: false, codigo: '', password: '' })
                    setRespaldo(null)
                    return r.message
                  })
                }
              >
                Desactivar verificación
              </Button>
              <Button variant="ghost" onClick={() => setDesactivar({ abierto: false, codigo: '', password: '' })}>
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </Tarjeta>

      <Tarjeta
        titulo="Sesiones activas"
        descripcion="Dispositivos donde tu cuenta tiene la sesión abierta. Si no reconoces alguno, ciérralo y cambia tu contraseña."
      >
        <ul className="space-y-2">
          {sesiones.map((s) => {
            const Icono = esMovil(s.dispositivo) ? Smartphone : Monitor
            return (
              <li
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-200 px-4 py-3 dark:border-ink-700"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <Icono className="mt-0.5 size-5 shrink-0 text-ink-400" />
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-ink-800 dark:text-ink-100">
                      <span className="truncate">{s.dispositivo}</span>
                      {s.actual && <Badge tone="green">Esta sesión</Badge>}
                    </p>
                    <p className="text-xs text-ink-500">
                      {s.ip ? `IP ${s.ip} · ` : ''}Inicio: {fechaHora(s.fecha_inicio)} · Último uso:{' '}
                      {fechaHora(s.fecha_ultimo_uso)}
                    </p>
                  </div>
                </div>
                {!s.actual && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-500"
                    loading={ocupado === s.id}
                    onClick={() =>
                      run(s.id, async () => {
                        await seguridadService.cerrarSesion(s.id)
                        return 'Sesión cerrada.'
                      })
                    }
                  >
                    <LogOut className="size-4" /> Cerrar
                  </Button>
                )}
              </li>
            )
          })}
        </ul>
        {otras > 0 && (
          <div className="flex justify-end">
            <Button
              variant="outline"
              loading={ocupado === 'otras'}
              onClick={() =>
                run('otras', async () => (await seguridadService.cerrarOtras()).message)
              }
            >
              Cerrar las otras {otras} sesión(es)
            </Button>
          </div>
        )}
      </Tarjeta>
    </div>
  )
}
