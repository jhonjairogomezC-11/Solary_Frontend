import { Link } from 'react-router-dom'

const enlace = 'font-medium text-solar-600 hover:underline dark:text-solar-400'

/** Texto de la casilla de aceptación del registro, con enlaces a los documentos. */
export function TextoAceptacion() {
  return (
    <>
      Acepto los{' '}
      <Link to="/terminos" target="_blank" rel="noopener" className={enlace}>
        términos y condiciones
      </Link>{' '}
      y autorizo el tratamiento de mis datos según la{' '}
      <Link to="/privacidad" target="_blank" rel="noopener" className={enlace}>
        política de tratamiento de datos
      </Link>
      .
    </>
  )
}
