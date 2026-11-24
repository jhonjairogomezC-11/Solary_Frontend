import type { ReactNode } from 'react'

import { slug } from '@/lib/legal'

/**
 * Renderizador mínimo de markdown para los documentos legales (sin HTML crudo).
 * Soporta: # ## ###, párrafos, listas "- " y "1. ", citas "> " y **negrita**.
 */
function inline(texto: string): ReactNode[] {
  return texto.split(/(\*\*[^*]+\*\*)/g).map((parte, i) =>
    parte.startsWith('**') && parte.endsWith('**') ? (
      <strong key={i} className="font-semibold text-ink-900 dark:text-white">
        {parte.slice(2, -2)}
      </strong>
    ) : (
      parte
    ),
  )
}

export function MarkdownLite({ source }: { source: string }) {
  const lineas = source.replace(/\r\n/g, '\n').split('\n')
  const bloques: ReactNode[] = []
  let i = 0
  while (i < lineas.length) {
    const l = lineas[i]
    if (!l.trim()) {
      i++
      continue
    }
    const h = /^(#{1,3})\s+(.*)$/.exec(l)
    if (h) {
      const nivel = h[1].length
      const texto = h[2]
      if (nivel === 1) {
        bloques.push(
          <h1 key={i} className="font-display text-3xl font-extrabold tracking-tight text-ink-900 dark:text-white">
            {inline(texto)}
          </h1>,
        )
      } else if (nivel === 2) {
        bloques.push(
          <h2 key={i} id={slug(texto)} className="mt-10 scroll-mt-24 font-display text-xl font-bold text-ink-900 dark:text-white">
            {inline(texto)}
          </h2>,
        )
      } else {
        bloques.push(
          <h3 key={i} className="mt-6 font-semibold text-ink-800 dark:text-ink-100">
            {inline(texto)}
          </h3>,
        )
      }
      i++
      continue
    }
    if (l.startsWith('> ')) {
      const partes: string[] = []
      while (i < lineas.length && lineas[i].startsWith('> ')) partes.push(lineas[i++].slice(2))
      bloques.push(
        <blockquote key={i} className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
          {inline(partes.join(' '))}
        </blockquote>,
      )
      continue
    }
    const esUl = /^- /.test(l)
    const esOl = /^\d+\.\s/.test(l)
    if (esUl || esOl) {
      const items: string[] = []
      const re = esUl ? /^- / : /^\d+\.\s/
      while (i < lineas.length && re.test(lineas[i])) items.push(lineas[i++].replace(re, ''))
      const cls = 'mt-3 space-y-1.5 pl-6 text-ink-600 dark:text-ink-300'
      bloques.push(
        esUl ? (
          <ul key={i} className={`${cls} list-disc`}>
            {items.map((t, k) => <li key={k}>{inline(t)}</li>)}
          </ul>
        ) : (
          <ol key={i} className={`${cls} list-decimal`}>
            {items.map((t, k) => <li key={k}>{inline(t)}</li>)}
          </ol>
        ),
      )
      continue
    }
    // La primera línea siempre se consume, así nunca se queda en un bucle infinito.
    const parrafo: string[] = [lineas[i++]]
    while (i < lineas.length && lineas[i].trim() && !/^(#{1,3}\s|> |- |\d+\.\s)/.test(lineas[i])) {
      parrafo.push(lineas[i++])
    }
    bloques.push(
      <p key={i} className="mt-3 leading-relaxed text-ink-600 dark:text-ink-300">
        {inline(parrafo.join(' '))}
      </p>,
    )
  }
  return <div className="text-[15px]">{bloques}</div>
}
