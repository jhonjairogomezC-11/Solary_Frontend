import { useCallback, useEffect, useState } from 'react'
import { Search, ShieldAlert, ShieldCheck, UserCog } from 'lucide-react'

import { adminService } from '@/services/adminService'
import type { AdminUsuario, PaginatedAdmin } from '@/types/admin'
import { cn } from '@/lib/utils'

const ROLES = ['', 'VOLUNTARIO', 'FUNDACION', 'ADMIN']
const ESTADOS = ['', 'ACTIVO', 'BLOQUEADO', 'SUSPENDIDO']

const estadoColor: Record<string, string> = {
  ACTIVO: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  BLOQUEADO: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  SUSPENDIDO: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
}

const rolColor: Record<string, string> = {
  ADMIN: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
  FUNDACION: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  VOLUNTARIO: 'bg-solar-100 text-solar-700 dark:bg-solar-500/15 dark:text-solar-300',
}

export function AdminUsuariosPage() {
  const [res, setRes] = useState<PaginatedAdmin<AdminUsuario> | null>(null)
  const [loading, setLoading] = useState(true)
  const [rol, setRol] = useState('')
  const [estado, setEstado] = useState('')
  const [buscar, setBuscar] = useState('')
  const [page, setPage] = useState(1)
  const [accion, setAccion] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminService.usuarios({
        rol: rol || undefined,
        estado: estado || undefined,
        buscar: buscar || undefined,
        page,
        per_page: 15,
      })
      setRes(data)
    } finally {
      setLoading(false)
    }
  }, [rol, estado, buscar, page])

  useEffect(() => {
    const t = setTimeout(() => void cargar(), 0)
    return () => clearTimeout(t)
  }, [cargar])

  const cambiarEstado = async (u: AdminUsuario, nuevo: string) => {
    let motivo: string | undefined
    if (nuevo !== 'ACTIVO') {
      motivo = window.prompt(`Motivo para ${nuevo.toLowerCase()} a ${u.nombre}:`) || undefined
      if (motivo === undefined) return
    }
    setAccion(u.id)
    try {
      await adminService.cambiarEstadoUsuario(u.id, nuevo, motivo)
      await cargar()
    } catch {
      window.alert('No se pudo cambiar el estado.')
    } finally {
      setAccion(null)
    }
  }

  const cambiarRol = async (u: AdminUsuario) => {
    const nuevo = window.prompt(
      `Nuevo rol para ${u.nombre} (VOLUNTARIO / FUNDACION / ADMIN):`,
      u.rol,
    )
    if (!nuevo || nuevo === u.rol) return
    setAccion(u.id)
    try {
      await adminService.cambiarRolUsuario(u.id, nuevo.toUpperCase())
      await cargar()
    } catch {
      window.alert('No se pudo cambiar el rol.')
    } finally {
      setAccion(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900 dark:text-white">Usuarios</h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
          Gestiona cuentas, estados y roles.
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
          <input
            value={buscar}
            onChange={(e) => {
              setPage(1)
              setBuscar(e.target.value)
            }}
            placeholder="Buscar por nombre o email…"
            className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-10 pr-3 text-sm dark:border-ink-700 dark:bg-ink-900"
          />
        </div>
        <select
          value={rol}
          onChange={(e) => {
            setPage(1)
            setRol(e.target.value)
          }}
          className="rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm dark:border-ink-700 dark:bg-ink-900"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r || 'Todos los roles'}
            </option>
          ))}
        </select>
        <select
          value={estado}
          onChange={(e) => {
            setPage(1)
            setEstado(e.target.value)
          }}
          className="rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm dark:border-ink-700 dark:bg-ink-900"
        >
          {ESTADOS.map((s) => (
            <option key={s} value={s}>
              {s || 'Todos los estados'}
            </option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-2xl border border-ink-200/60 bg-white dark:border-ink-800 dark:bg-ink-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink-200/60 text-xs uppercase text-ink-400 dark:border-ink-800">
            <tr>
              <th className="px-4 py-3">Usuario</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Registro</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-ink-400">
                  Cargando…
                </td>
              </tr>
            ) : res && res.data.length > 0 ? (
              res.data.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-ink-100 last:border-0 dark:border-ink-800/60"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink-900 dark:text-white">{u.nombre}</p>
                    <p className="text-xs text-ink-400">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-1 text-xs font-semibold',
                        rolColor[u.rol],
                      )}
                    >
                      {u.rol}
                    </span>
                    {u.rol === 'FUNDACION' && u.estado_verificacion_fundacion && (
                      <span className="ml-1 text-[10px] text-ink-400">
                        ({u.estado_verificacion_fundacion})
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-1 text-xs font-semibold',
                        estadoColor[u.estado],
                      )}
                    >
                      {u.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-500">
                    {new Date(u.fecha_registro).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      {u.estado === 'ACTIVO' ? (
                        <button
                          disabled={accion === u.id}
                          onClick={() => cambiarEstado(u, 'BLOQUEADO')}
                          title="Bloquear"
                          className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-40 dark:hover:bg-red-500/10"
                        >
                          <ShieldAlert className="size-4" />
                        </button>
                      ) : (
                        <button
                          disabled={accion === u.id}
                          onClick={() => cambiarEstado(u, 'ACTIVO')}
                          title="Activar"
                          className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 disabled:opacity-40 dark:hover:bg-emerald-500/10"
                        >
                          <ShieldCheck className="size-4" />
                        </button>
                      )}
                      <button
                        disabled={accion === u.id}
                        onClick={() => cambiarRol(u)}
                        title="Cambiar rol"
                        className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100 disabled:opacity-40 dark:hover:bg-ink-800"
                      >
                        <UserCog className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-ink-400">
                  No hay usuarios con esos filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {res && res.pages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink-500">
            {res.total} usuarios · página {res.page} de {res.pages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-ink-200 px-3 py-1.5 disabled:opacity-40 dark:border-ink-700"
            >
              Anterior
            </button>
            <button
              disabled={page >= res.pages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-ink-200 px-3 py-1.5 disabled:opacity-40 dark:border-ink-700"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
