import { api } from '@/lib/apiClient'

/**
 * Abre un documento privado (identidad o verificación).
 *
 * Los documentos no tienen URL pública: se piden a la API con la sesión del
 * usuario y se muestran desde un enlace temporal local del navegador.
 */
export async function abrirArchivoPrivado(ruta: string): Promise<void> {
  // La ventana se abre antes de la petición para que el navegador no la bloquee.
  const ventana = window.open('', '_blank')
  try {
    const { data } = await api.get<Blob>(ruta, { responseType: 'blob' })
    const url = URL.createObjectURL(data)
    if (ventana) ventana.location.href = url
    else window.location.href = url
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  } catch (err) {
    ventana?.close()
    throw err
  }
}
