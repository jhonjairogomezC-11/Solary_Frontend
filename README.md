# Solari — Frontend web

Interfaz web de **Solari**, la plataforma que conecta voluntarios y fundaciones.
Esta fase cubre el módulo de **autenticación** (Fase 1 del backend): landing,
registro de voluntarios y fundaciones, inicio de sesión local y con Google,
recuperación/restablecimiento de contraseña y un panel base tras iniciar sesión.

Es un frontend **nuevo e independiente**. No reemplaza la app móvil Flutter ni el
frontend Vue existentes.

## Stack

- **React 19 + Vite + TypeScript**
- **Tailwind CSS v4** (tema cálido "solar" con modo claro/oscuro)
- **React Router 7** — navegación y rutas protegidas
- **TanStack Query + Axios** — datos y refresh automático de token en 401
- **React Hook Form + Zod** — formularios y validación espejo del backend
- **Framer Motion + lucide-react** — animaciones e iconos

## Requisitos

- Node.js 20+ (probado en Node 24)
- El backend **Solari** corriendo en `http://localhost:8001`
  (ver `Solari backend/INSTALACION.md`; en Windows se arranca con `python run.py`)

## Puesta en marcha

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar entorno
#    Copia .env.example a .env y ajusta si es necesario.
copy .env.example .env   # Windows
# cp .env.example .env    # macOS/Linux

# 3. Arrancar en desarrollo (http://localhost:5173)
npm run dev
```

> El puerto **5173** es obligatorio en desarrollo: el backend lo tiene permitido
> en su configuración de CORS (`CORS_ORIGINS`). Vite usa `strictPort`, así que si
> el puerto está ocupado fallará en lugar de cambiar a otro. Libera el 5173 antes
> de arrancar.

## Variables de entorno

| Variable | Descripción |
|---|---|
| `VITE_API_BASE_URL` | URL base de la API. Por defecto `http://localhost:8001/api/v1`. |
| `VITE_GOOGLE_CLIENT_ID` | Client ID de Google OAuth (público). Debe coincidir con el `GOOGLE_CLIENT_ID` del backend. Si queda vacío, el botón de Google no se muestra. |

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con HMR. |
| `npm run build` | Type-check + build de producción en `dist/`. |
| `npm run preview` | Sirve el build de producción localmente. |
| `npm run lint` | ESLint sobre todo el proyecto. |

## Estructura

```
src/
├── auth/              # Contexto de sesión (AuthProvider, useAuth)
├── components/
│   ├── auth/          # Google, selector de rol, formularios de registro
│   ├── layout/        # AuthLayout (panel partido)
│   ├── routing/       # Guards de rutas públicas/protegidas
│   └── ui/            # Botones, inputs, select, alerts, logo, tema...
├── hooks/             # useTheme
├── lib/               # apiClient (axios + refresh), config, validators (zod), utils
├── pages/             # Landing, Login, Register, Forgot/Reset, Dashboard, 404
├── services/          # authService (llamadas a la API)
└── types/             # Tipos del dominio de auth
```

## Integración con el backend

- El cliente Axios adjunta `Authorization: Bearer <token>` y, ante un `401`,
  intenta **renovar** con el refresh token (rotación) antes de reintentar la
  petición, igual que la app móvil. Si el refresh falla, limpia la sesión.
- Las respuestas de login/registro siguen el contrato compartido:
  `{ usuario, token, refresh_token, token_type, expires_in }`.
- Las rutas `/reset-password` y `/verify-email` coinciden con las URLs que el
  backend incluye en los correos (`FRONTEND_RESET_URL`, `FRONTEND_VERIFY_URL`).

## Notas de seguridad

- La validación de formularios (Zod) es solo para UX; la validación real ocurre
  siempre en el backend.
- El rol de la cuenta se fija en el backend; el cliente nunca puede concederse
  privilegios de administrador.
- Los tokens se guardan en `localStorage` por simplicidad de integración con el
  contrato móvil. En despliegue conviene una CSP estricta; si más adelante se
  añade un backend-for-frontend, migrar a cookies `httpOnly`.

## Pendiente (siguientes fases)

- Catálogo de municipios desde un endpoint real (hoy es una lista base en
  `src/lib/catalogs.ts`).
- Página de verificación de email (`/verify-email`) cuando el backend active el
  envío de correos (hoy en modo `console`).
- Módulos funcionales (convocatorias, postulaciones, notificaciones) marcados
  como "Próximamente" en el panel.
```
