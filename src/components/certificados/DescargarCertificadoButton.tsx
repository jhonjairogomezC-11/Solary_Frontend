import { useState } from 'react'
import { FileDown } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { parseApiError } from '@/lib/apiClient'
import { cn } from '@/lib/utils'
import { certificadoService } from '@/services/certificadoService'

interface Props {
  postulacionId: string
  className?: string
}

export function DescargarCertificadoButton({ postulacionId, className }: Props) {
  const [descargando, setDescargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const descargar = async () => {
    setDescargando(true)
    setError(null)
    try {
      await certificadoService.descargar(postulacionId)
    } catch (err) {
      setError(parseApiError(err).message)
    } finally {
      setDescargando(false)
    }
  }

  return (
    <div className={cn('flex flex-col items-start gap-1', className)}>
      <Button variant="outline" size="sm" loading={descargando} onClick={descargar}>
        {!descargando && <FileDown className="size-4" aria-hidden />}
        Descargar certificado
      </Button>
      {error && (
        <p role="alert" className="text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  )
}
