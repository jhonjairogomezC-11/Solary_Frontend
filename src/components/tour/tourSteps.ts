/**
 * Pasos del tutorial de bienvenida.
 * `target` es el valor del atributo `data-tour` del elemento a resaltar (en el menú lateral
 * es la ruta del ítem). Sin `target`, el paso se muestra centrado en la pantalla.
 */
export interface TourStep {
  target?: string
  titulo: string
  texto: string
}

export const TARGET_TUTORIAL = 'ver-tutorial'

const bienvenida = (nombre: string, rol: string): TourStep => ({
  titulo: `¡Hola, ${nombre}! Bienvenido a Solari`,
  texto: `Te mostramos en un minuto para qué sirve cada sección de tu cuenta de ${rol}. Avanza con las flechas o con las teclas ← y → de tu teclado.`,
})

const cierre: TourStep = {
  target: TARGET_TUTORIAL,
  titulo: '¡Listo para empezar!',
  texto:
    'Ya conoces Solari. Si quieres repasar, puedes volver a ver este recorrido cuando quieras desde este botón.',
}

export function pasosVoluntario(nombre: string): TourStep[] {
  return [
    bienvenida(nombre, 'voluntario'),
    {
      target: '/app',
      titulo: 'Panel',
      texto:
        'Tu punto de partida: un resumen de tu actividad, tus próximas actividades y convocatorias recomendadas para ti.',
    },
    {
      target: '/app/convocatorias',
      titulo: 'Explorar',
      texto:
        'Encuentra convocatorias de voluntariado. Filtra por categoría, modalidad y municipio, y mira qué tanto coinciden con tus habilidades.',
    },
    {
      target: '/app/mis-postulaciones',
      titulo: 'Mis postulaciones',
      texto:
        'Sigue el estado de cada postulación, escríbele a la organización, retírate si no puedes asistir y descarga tus certificados.',
    },
    {
      target: '/app/calendario',
      titulo: 'Calendario',
      texto:
        'Tus actividades aceptadas organizadas por fecha. Puedes añadirlas a tu calendario personal para no olvidarlas.',
    },
    {
      target: '/app/favoritos',
      titulo: 'Favoritos',
      texto: 'Las convocatorias que guardaste con el corazón, para revisarlas o postularte más tarde.',
    },
    {
      target: '/app/trayectoria',
      titulo: 'Mi trayectoria',
      texto: 'Tu historial de voluntariado: actividades realizadas, horas acumuladas y calificaciones recibidas.',
    },
    {
      target: '/app/habilidades',
      titulo: 'Mis habilidades',
      texto:
        'Marca lo que sabes hacer. Con tus habilidades calculamos tu coincidencia con cada convocatoria y te recomendamos mejores opciones.',
    },
    {
      target: '/app/ofrecimientos',
      titulo: 'Objetos y servicios',
      texto:
        'Dona objetos u ofrece servicios gratuitos a las organizaciones que los necesitan. Solari no maneja pagos ni ventas.',
    },
    {
      target: '/app/logros',
      titulo: 'Logros y XP',
      texto:
        'Cada asistencia confirmada te da puntos de experiencia (XP) y puede desbloquear logros.',
    },
    {
      target: '/app/ranking',
      titulo: 'Ranking',
      texto: 'Mira cómo va tu experiencia frente a la de otros voluntarios de la comunidad.',
    },
    {
      target: '/app/notificaciones',
      titulo: 'Notificaciones',
      texto:
        'Avisos de tus postulaciones, mensajes nuevos y recordatorios. Toca una notificación para ir directo a lo que trata.',
    },
    {
      target: '/app/soporte',
      titulo: 'Ayuda',
      texto:
        'El Centro de ayuda: crea solicitudes al equipo de Solari y, en "Cuenta y privacidad", gestiona tus datos o tu cuenta.',
    },
    {
      target: '/app/seguridad',
      titulo: 'Seguridad',
      texto: 'Activa la verificación en dos pasos y revisa o cierra las sesiones abiertas en otros dispositivos.',
    },
    {
      target: '/app/perfil',
      titulo: 'Mi perfil',
      texto:
        'Actualiza tus datos y tu foto, y sube tu documento para obtener la insignia de verificado.',
    },
    cierre,
  ]
}

export function pasosFundacion(nombre: string): TourStep[] {
  return [
    bienvenida(nombre, 'organización'),
    {
      target: '/app',
      titulo: 'Panel',
      texto: 'Un resumen de tus convocatorias, postulaciones pendientes y próximas actividades.',
    },
    {
      target: '/app/mis-convocatorias',
      titulo: 'Mis convocatorias',
      texto:
        'Crea y edita convocatorias, revisa a los postulantes y acéptalos o recházalos. Cuando la actividad termine, registra la asistencia y califica a cada voluntario.',
    },
    {
      target: '/app/convocatorias',
      titulo: 'Explorar',
      texto: 'Mira las convocatorias publicadas en la plataforma, también las de otras organizaciones.',
    },
    {
      target: '/app/calendario',
      titulo: 'Calendario',
      texto: 'Todas tus actividades organizadas por fecha, para planear con tiempo.',
    },
    {
      target: '/app/programaciones',
      titulo: 'Actividades recurrentes',
      texto:
        'Programa actividades que se repiten (por ejemplo, cada semana) y Solari creará las convocatorias por ti.',
    },
    {
      target: '/app/ofrecimientos',
      titulo: 'Objetos y servicios',
      texto:
        'Objetos y servicios que los voluntarios ofrecen gratis. Toca "Me interesa" para solicitarlos y coordinar la entrega.',
    },
    {
      target: '/app/notificaciones',
      titulo: 'Notificaciones',
      texto:
        'Avisos de nuevas postulaciones, mensajes y cambios. Toca una notificación para ir directo a lo que trata.',
    },
    {
      target: '/app/soporte',
      titulo: 'Ayuda',
      texto: 'El Centro de ayuda: escríbele al equipo de Solari y gestiona los datos de tu cuenta.',
    },
    {
      target: '/app/perfil-publico',
      titulo: 'Perfil público',
      texto:
        'Así te ven los voluntarios: tu descripción, galería de fotos y reseñas. Desde aquí también pides la verificación de tu organización.',
    },
    {
      target: '/app/seguridad',
      titulo: 'Seguridad',
      texto: 'Activa la verificación en dos pasos y revisa las sesiones abiertas.',
    },
    {
      target: '/app/perfil',
      titulo: 'Mi perfil',
      texto: 'Los datos de contacto de tu organización.',
    },
    cierre,
  ]
}
