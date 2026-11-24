# Solari — Frontend web

Aplicación web de **Solari**, la plataforma que conecta voluntarios con organizaciones
sociales. Cubre los tres roles (voluntario, organización y administrador) y consume la API
del backend FastAPI (`../Solary backend`).

La visión general del sistema (módulos, reglas de negocio, base de datos, cumplimiento
legal y pendientes) está en **`../Solary backend/README.md`**. Este README se centra en el
frontend.

## Índice

1. [Stack](#1-stack)
2. [Puesta en marcha](#2-puesta-en-marcha)
3. [Estructura](#3-estructura)
4. [Rutas](#4-rutas)
5. [Flujo de ingreso y guardias de rutas](#5-flujo-de-ingreso-y-guardias-de-rutas)
6. [Tutorial de bienvenida](#6-tutorial-de-bienvenida)
7. [Páginas legales y aceptación](#7-páginas-legales-y-aceptación)
8. [Formularios y validación](#8-formularios-y-validación)
9. [Integración con el backend](#9-integración-con-el-backend)
10. [Datos guardados en el navegador](#10-datos-guardados-en-el-navegador)
11. [Pruebas e integración continua](#11-pruebas-e-integración-continua)
12. [Notas de seguridad](#12-notas-de-seguridad)
13. [Pendientes](#13-pendientes)

---

## 1. Stack

| Tecnología | Uso |
|---|---|
| React 19 + Vite 8 + TypeScript 6 | Base de la aplicación; páginas con carga diferida (`lazy`) |
| Tailwind CSS v4 | Estilos; tema cálido "solar" con modo claro y oscuro |
| React Router 7 | Navegación y guardias de rutas |
| Axios | Cliente HTTP con renovación automática del token |
| React Hook Form + Zod | Formularios y validación espejo del backend |
| Framer Motion | Animaciones (incluido el tutorial) |
| lucide-react | Íconos |
| Vitest + Testing Library | Pruebas |

No usa librerías externas para el tutorial ni para mostrar markdown: ambos están hechos
en el propio proyecto (`src/components/tour`, `src/components/legal`).

---

## 2. Puesta en marcha

Requisitos: Node.js 20 o superior (CI usa Node 22) y el backend corriendo en
`http://localhost:9000`.

```powershell
cd "Solary frontend"
npm install
copy .env.example .env   # revisar VITE_API_BASE_URL
npm run dev              # http://localhost:5173
```

El puerto **5173** es obligatorio en desarrollo: está permitido en `CORS_ORIGINS` del
backend y Vite usa `strictPort`, así que si el puerto está ocupado falla en lugar de
cambiar a otro.

| Variable | Descripción |
|---|---|
| `VITE_API_BASE_URL` | URL base de la API. En desarrollo: `http://localhost:9000/api/v1` |
| `VITE_GOOGLE_CLIENT_ID` | Client ID de Google OAuth (público). Debe coincidir con `GOOGLE_CLIENT_ID` del backend. Si queda vacío, el botón de Google no se muestra |

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Verificación de tipos + build de producción en `dist/` |
| `npm run preview` | Sirve el build de producción localmente |
| `npm run lint` | ESLint sobre todo el proyecto |
| `npm test` | Pruebas (Vitest, una sola corrida) |
| `npm run test:watch` | Pruebas en modo observación |
| `npm run coverage` | Pruebas con cobertura |

---

## 3. Estructura

```
src/
├── App.tsx              # Todas las rutas
├── auth/                # AuthContext: sesión, usuario, refreshUsuario, logout
├── components/
│   ├── admin/           # Gráficas y tarjetas del panel de administración
│   ├── auth/            # Formularios de registro, Google, selector de rol,
│   │                    # OnboardingChrome (barra de sesión + indicador de pasos)
│   ├── certificados/    # Botón de descarga de certificado
│   ├── convocatorias/   # Tarjeta de convocatoria, botón de favorito
│   ├── layout/          # AppLayout (menú lateral por rol), AdminLayout, AuthLayout
│   ├── legal/           # MarkdownLite (render de documentos), TextoAceptacion
│   ├── mensajes/        # Chat de una postulación
│   ├── perfil/          # Autorización del acudiente (menores)
│   ├── routing/         # Guardias: pública, protegida (con flujo de ingreso), admin
│   ├── tour/            # Tutorial de bienvenida (Tour, tourContext, tourSteps)
│   └── ui/              # Button, Input, Select, Checkbox, Alert, Badge, Logo, tema…
├── hooks/               # useFavoritos, useMunicipios, useNotificacionesEnVivo, useTheme
├── lib/                 # apiClient, tokenStore, validators (Zod), formErrors, legal,
│                        # archivos privados, catálogos, config, utils
├── pages/               # Públicas, autenticación, legales y pasos del flujo de ingreso
├── pages/app/           # Pantallas de voluntario y organización
├── pages/admin/         # Panel de administración
├── services/            # Llamadas a la API por módulo
└── types/               # Tipos del dominio (auth, convocatoria, alineacion, admin, voluntario)
```

---

## 4. Rutas

### Públicas

| Ruta | Pantalla |
|---|---|
| `/` | Página de inicio (con enlaces a los documentos legales en el pie) |
| `/login`, `/registro`, `/recuperar`, `/reset-password` | Autenticación (solo sin sesión) |
| `/verify-email?token=…` (también `/verify-email/:token`) | Confirmación del correo desde el enlace del mensaje |
| `/terminos`, `/privacidad` | Términos y Condiciones, y Política de Tratamiento de Datos |
| `/404` | Página no encontrada |

### Flujo de ingreso (con sesión, antes del panel)

| Ruta | Pantalla |
|---|---|
| `/verifica-tu-correo` | "Confirma tu correo": reenviar, comprobar, cerrar sesión |
| `/completar-perfil` | "Completa tu perfil" del voluntario (datos obligatorios) |

### Aplicación (`/app`)

| Ruta | Pantalla | Rol |
|---|---|---|
| `/app` | Panel | Ambos |
| `/app/convocatorias`, `/app/convocatorias/:id` | Explorar (con "Limpiar filtros") y detalle | Ambos |
| `/app/mis-postulaciones` | Postulaciones con pestañas Activas / Historial / Todas | Voluntario |
| `/app/favoritos`, `/app/intereses`, `/app/habilidades` | Favoritos, intereses y habilidades | Voluntario |
| `/app/logros`, `/app/ranking`, `/app/trayectoria` | Gamificación y trayectoria | Voluntario |
| `/app/mis-convocatorias`, `/app/convocatorias/nueva`, `/app/convocatorias/:id/editar` | Gestión de convocatorias | Organización |
| `/app/convocatorias/:id/postulaciones` | Postulantes, asistencia y calificación (solo al terminar la actividad) | Organización |
| `/app/programaciones` | Actividades recurrentes | Organización |
| `/app/perfil-publico`, `/app/organizaciones/:id` | Perfil público (edición y vista) | Organización / Ambos |
| `/app/ofrecimientos`, `/app/solicitudes-interes` | Objetos y servicios, y sus solicitudes | Ambos |
| `/app/calendario` | Calendario de actividades | Ambos |
| `/app/notificaciones` | Notificaciones; cada una lleva a su destino | Ambos |
| `/app/soporte` | Centro de ayuda (tickets, cuenta y privacidad) | Ambos |
| `/app/seguridad` | Sesiones y verificación en dos pasos | Ambos |
| `/app/perfil` | Mi perfil | Ambos |

### Administración (`/admin`, solo rol `ADMIN`)

`/admin`, `/admin/usuarios`, `/admin/voluntarios`, `/admin/autorizaciones`,
`/admin/fundaciones`, `/admin/convocatorias`, `/admin/postulaciones`, `/admin/catalogos`,
`/admin/gestion`, `/admin/seguridad`.

### Destino de cada notificación

`NotificacionesPage.tsx` (función `rutaDeNotificacion`) decide adónde lleva cada
notificación según `objeto_tipo`, `tipo` y el rol:

| Notificación | Destino |
|---|---|
| Mensaje en una postulación | Voluntario: `/app/mis-postulaciones?chat=<id>`. Organización: `/app/convocatorias/<publicacion_id>/postulaciones?chat=<id>` |
| Mensaje en una solicitud de interés | `/app/solicitudes-interes?chat=<id>` |
| Respuesta de soporte | `/app/soporte?ticket=<id>` |
| Nueva postulación o retiro (organización) | Postulantes de esa convocatoria |
| Cambios de postulación | Mis postulaciones (voluntario) o Mis convocatorias (organización) |
| Actividad modificada o cancelada | Detalle de la convocatoria |
| Reseña o verificación | Perfil público (organización) o página de la organización (voluntario) |
| XP, logros, programación pausada | Trayectoria, Logros, Programaciones |

Las pantallas de destino leen `?chat=` o `?ticket=` al cargar y abren ese elemento.

---

## 5. Flujo de ingreso y guardias de rutas

`src/components/routing/RouteGuards.tsx`:

- **`PublicOnlyRoute`**: login y registro; si ya hay sesión, redirige a `/app` o `/admin`.
- **`AdminRoute`**: solo rol `ADMIN`.
- **`ProtectedRoute`**: exige sesión y encadena los pasos del flujo de ingreso:

```
¿correo confirmado?  ── no ──▶ /verifica-tu-correo
        │ sí
¿es voluntario con teléfono, dirección y contacto de emergencia?  ── no ──▶ /completar-perfil
        │ sí
       /app  (el tutorial se abre la primera vez)
```

- Los administradores no pasan por estos pasos.
- Si el voluntario no tiene perfil (por ejemplo, entró con Google), lo completa en
  `/app/perfil`.
- Las pantallas del flujo muestran `SessionBar` ("Sesión iniciada", correo y botón
  "Cerrar sesión") y `PasosRegistro` (Cuenta creada → Confirmar correo → Completar perfil).
- El backend aplica las mismas reglas, así que el bloqueo no depende solo del frontend.

---

## 6. Tutorial de bienvenida

Recorrido guiado por los módulos del menú lateral. Oscurece la pantalla, resalta cada
módulo y muestra una tarjeta con su explicación.

| Aspecto | Detalle |
|---|---|
| Cuándo aparece | Solo, la primera vez que el usuario entra a `/app` |
| Pasos | Voluntario: 16. Organización: 13 |
| Navegación | Flechas de la tarjeta, teclas ← y →, puntos de progreso; Esc o "Saltar tutorial" para cerrar |
| Repetirlo | Botón "Ver tutorial" del menú lateral (el último paso lo señala) |
| Celular | El menú lateral está oculto, así que las tarjetas salen centradas |
| Dónde se recuerda | `localStorage`, clave `solari.tour.v1.<id del usuario>` |

**Editar los textos**: `src/components/tour/tourSteps.ts`. Cada paso tiene `target`
(el valor `data-tour` del elemento; en el menú es la ruta del ítem, por ejemplo
`/app/convocatorias`), `titulo` y `texto`. Un paso sin `target` sale centrado.

**Agregar un módulo nuevo al tutorial**: el ítem del menú ya tiene `data-tour={to}`
(`AppLayout.tsx`), así que basta con agregar un paso con esa ruta como `target`.

**Volver a ver el tutorial como usuario nuevo**: borrar la clave
`solari.tour.v1.<id>` en las herramientas del navegador (Aplicación › Almacenamiento local).

Si se cambia mucho el contenido y se quiere que todos lo vean otra vez, sube la versión
de la clave (`v1` → `v2`) en `Tour.tsx`.

---

## 7. Páginas legales y aceptación

- `/terminos` y `/privacidad` (`src/pages/LegalPage.tsx`) leen el documento vigente de
  `GET /legal/documentos` y lo muestran con índice lateral, versión y fecha de publicación.
- El texto se renderiza con `MarkdownLite` (títulos, párrafos, listas, citas y negrita),
  sin HTML crudo.
- El contenido **no vive en el frontend**: se edita en
  `../Solary backend/docs/legal/*.md` y se publica con
  `scripts/seed_documentos_legales.py` (ver el README del backend, sección 7).
- En el registro, la casilla (`TextoAceptacion`) enlaza a los dos documentos (se abren en
  otra pestaña) y el formulario envía `aceptaciones` con los códigos de `src/lib/legal.ts`.

---

## 8. Formularios y validación

- Los esquemas Zod de `src/lib/validators.ts` replican las reglas del backend para dar
  respuesta inmediata. **La validación definitiva siempre la hace el backend.**
- Registro de voluntario: el nombre se pide en cuatro campos (primer nombre y primer
  apellido obligatorios; segundo nombre y segundo apellido opcionales; solo letras, de 2 a
  30 caracteres). `componerNombre` los une en el campo `nombre` que espera la API.
- Contraseña: mínimo 8 caracteres, con mayúscula, minúscula y número.
- Edad mínima: 16 años (`EDAD_MINIMA`), igual que `app/core/edad.py` del backend.
- Si el formulario tiene errores, `resumenErrores` (`src/lib/formErrors.ts`) muestra una
  alerta arriba con cada campo y su motivo, y la página sube hasta ella.
- Campos no editables después del registro (aparecen bloqueados en "Mi perfil"):
  - Voluntario: tipo y número de documento, fecha de nacimiento y género.
  - Organización: nombre, tipo, constitución legal, NIT, representante legal y documento
    legal.

---

## 9. Integración con el backend

- **Sesión**: el cliente Axios (`src/lib/apiClient.ts`) adjunta
  `Authorization: Bearer <token>`. Ante un `401`, renueva una sola vez con el refresh token
  (con cola para no hacer renovaciones en paralelo) y reintenta. Si falla, cierra la sesión.
- **Contrato de login y registro**: `{ usuario, token, refresh_token, token_type, expires_in }`,
  el mismo que usa la app móvil.
- **Notificaciones en vivo** (`useNotificacionesEnVivo`): pide un ticket de vida corta a
  `/notificaciones/stream-ticket` y abre un `EventSource` a `/notificaciones/stream`
  (EventSource no puede enviar la cabecera `Authorization`). Si la conexión falla, consulta
  cada 30 segundos.
- **Archivos privados** (`src/lib/archivos.ts`): los documentos de identidad se descargan
  con sesión por `/archivos/privado`, nunca por una URL pública.
- **Correos**: `/reset-password` y `/verify-email` coinciden con `FRONTEND_RESET_URL` y
  `FRONTEND_VERIFY_URL` del backend.

---

## 10. Datos guardados en el navegador

| Clave de `localStorage` | Contenido |
|---|---|
| `solari.access`, `solari.refresh` | Tokens de sesión |
| `solari.theme` | Tema claro u oscuro |
| `solari.tour.v1.<id>` | Marca de que el usuario ya vio el tutorial |

No se usan cookies de publicidad ni de rastreo. Esta tabla está reflejada en la Política
de Tratamiento de Datos.

---

## 11. Pruebas e integración continua

```powershell
npm test        # 95 pruebas en 11 archivos
npm run lint
npm run build
```

Las pruebas cubren componentes de interfaz (`Button`, `Input`, `Select`,
`ConvocatoriaCard`, `DescargarCertificadoButton`), `useMunicipios`, el cliente HTTP, el
almacenamiento de tokens, utilidades, la edad mínima y los esquemas de validación.

**CI** (`.github/workflows/ci.yml`, en push y PR a `master`): Node 22, `npm ci`,
`npm run lint`, `npm test` y `npm run build`.

---

## 12. Notas de seguridad

- El rol de la cuenta lo fija el backend; el cliente nunca puede darse privilegios.
- Las guardias de rutas son para la experiencia del usuario; los permisos reales los
  aplica la API.
- Los tokens se guardan en `localStorage` por compatibilidad con el contrato móvil. En
  despliegue conviene una política CSP estricta y, si se agrega un backend-for-frontend,
  migrar a cookies `httpOnly`.
- Los documentos legales se muestran sin `dangerouslySetInnerHTML`.

---

## 13. Pendientes

- El tutorial se recuerda solo por navegador; para recordarlo entre dispositivos hay que
  guardarlo en el backend.
- El registro con Google no muestra la casilla de aceptación de los documentos legales.
- No hay flujo para que un usuario existente acepte una versión nueva de los documentos.
- Faltan pruebas de las pantallas nuevas (flujo de ingreso, tutorial, páginas legales).
- Los catálogos de tipo de documento, género y disponibilidad están fijos en
  `src/lib/catalogs.ts`; los municipios sí vienen de la API.
