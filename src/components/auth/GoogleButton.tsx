import { useEffect, useRef } from 'react'

import { config, isGoogleEnabled } from '@/lib/config'

interface GoogleButtonProps {
  onCredential: (idToken: string) => void
  text?: 'signin_with' | 'signup_with' | 'continue_with'
}

interface GoogleAccounts {
  id: {
    initialize: (opts: {
      client_id: string
      callback: (resp: { credential: string }) => void
      ux_mode?: 'popup' | 'redirect'
    }) => void
    renderButton: (parent: HTMLElement, opts: Record<string, unknown>) => void
  }
}

declare global {
  interface Window {
    google?: { accounts: GoogleAccounts }
  }
}

const SCRIPT_SRC = 'https://accounts.google.com/gsi/client'

function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts) {
      resolve()
      return
    }
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('No se pudo cargar Google')))
      return
    }
    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('No se pudo cargar Google'))
    document.head.appendChild(script)
  })
}

export function GoogleButton({ onCredential, text = 'continue_with' }: GoogleButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isGoogleEnabled) return
    let cancelled = false

    void loadGoogleScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.google) return
        window.google.accounts.id.initialize({
          client_id: config.googleClientId,
          callback: (resp) => onCredential(resp.credential),
        })
        window.google.accounts.id.renderButton(containerRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text,
          shape: 'pill',
          logo_alignment: 'center',
          width: 320,
        })
      })
      .catch(() => {
        // Silencioso: si Google no carga, el usuario aún puede usar correo.
      })

    return () => {
      cancelled = true
    }
  }, [onCredential, text])

  if (!isGoogleEnabled) return null

  return (
    <div className="flex justify-center">
      <div ref={containerRef} className="overflow-hidden rounded-full" />
    </div>
  )
}
