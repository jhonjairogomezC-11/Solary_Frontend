import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { AuthProvider } from '@/auth/AuthContext'
import { AdminRoute, ProtectedRoute, PublicOnlyRoute } from '@/components/routing/RouteGuards'
import { AppLayout } from '@/components/layout/AppLayout'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Logo } from '@/components/ui/Logo'

const LandingPage = lazy(() =>
  import('@/pages/LandingPage').then((m) => ({ default: m.LandingPage })),
)
const LoginPage = lazy(() => import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })))
const RegisterPage = lazy(() =>
  import('@/pages/RegisterPage').then((m) => ({ default: m.RegisterPage })),
)
const ForgotPasswordPage = lazy(() =>
  import('@/pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })),
)
const ResetPasswordPage = lazy(() =>
  import('@/pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })),
)
const VerifyEmailPage = lazy(() =>
  import('@/pages/VerifyEmailPage').then((m) => ({ default: m.VerifyEmailPage })),
)
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
)

// App (protegida)
const DashboardHome = lazy(() =>
  import('@/pages/app/DashboardHome').then((m) => ({ default: m.DashboardHome })),
)
const ExplorarPage = lazy(() =>
  import('@/pages/app/ExplorarPage').then((m) => ({ default: m.ExplorarPage })),
)
const ConvocatoriaDetallePage = lazy(() =>
  import('@/pages/app/ConvocatoriaDetallePage').then((m) => ({ default: m.ConvocatoriaDetallePage })),
)
const CrearConvocatoriaPage = lazy(() =>
  import('@/pages/app/CrearConvocatoriaPage').then((m) => ({ default: m.CrearConvocatoriaPage })),
)
const MisConvocatoriasPage = lazy(() =>
  import('@/pages/app/MisConvocatoriasPage').then((m) => ({ default: m.MisConvocatoriasPage })),
)
const PostulacionesPage = lazy(() =>
  import('@/pages/app/PostulacionesPage').then((m) => ({ default: m.PostulacionesPage })),
)
const MisPostulacionesPage = lazy(() =>
  import('@/pages/app/MisPostulacionesPage').then((m) => ({ default: m.MisPostulacionesPage })),
)
const NotificacionesPage = lazy(() =>
  import('@/pages/app/NotificacionesPage').then((m) => ({ default: m.NotificacionesPage })),
)
const CompletarPerfilPage = lazy(() =>
  import('@/pages/app/CompletarPerfilPage').then((m) => ({ default: m.CompletarPerfilPage })),
)
const FavoritosPage = lazy(() =>
  import('@/pages/app/FavoritosPage').then((m) => ({ default: m.FavoritosPage })),
)
const InteresesPage = lazy(() =>
  import('@/pages/app/InteresesPage').then((m) => ({ default: m.InteresesPage })),
)
const LogrosPage = lazy(() =>
  import('@/pages/app/LogrosPage').then((m) => ({ default: m.LogrosPage })),
)
const RankingPage = lazy(() =>
  import('@/pages/app/RankingPage').then((m) => ({ default: m.RankingPage })),
)
const TrayectoriaPage = lazy(() =>
  import('@/pages/app/TrayectoriaPage').then((m) => ({ default: m.TrayectoriaPage })),
)
const SoportePage = lazy(() =>
  import('@/pages/app/SoportePage').then((m) => ({ default: m.SoportePage })),
)

// Admin (protegido por rol ADMIN)
const HabilidadesPage = lazy(() =>
  import('@/pages/app/HabilidadesPage').then((m) => ({ default: m.HabilidadesPage })),
)
const ProgramacionesPage = lazy(() =>
  import('@/pages/app/ProgramacionesPage').then((m) => ({ default: m.ProgramacionesPage })),
)
const OfrecimientosPage = lazy(() =>
  import('@/pages/app/OfrecimientosPage').then((m) => ({ default: m.OfrecimientosPage })),
)
const SolicitudesInteresPage = lazy(() =>
  import('@/pages/app/SolicitudesInteresPage').then((m) => ({ default: m.SolicitudesInteresPage })),
)
const OrganizacionPublicaPage = lazy(() =>
  import('@/pages/app/OrganizacionPublicaPage').then((m) => ({ default: m.OrganizacionPublicaPage })),
)
const PerfilPublicoPage = lazy(() =>
  import('@/pages/app/PerfilPublicoPage').then((m) => ({ default: m.PerfilPublicoPage })),
)
const AdminGestionPage = lazy(() =>
  import('@/pages/admin/AdminGestionPage').then((m) => ({ default: m.AdminGestionPage })),
)
const AdminDashboardPage = lazy(() =>
  import('@/pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })),
)
const AdminUsuariosPage = lazy(() =>
  import('@/pages/admin/AdminUsuariosPage').then((m) => ({ default: m.AdminUsuariosPage })),
)
const AdminFundacionesPage = lazy(() =>
  import('@/pages/admin/AdminFundacionesPage').then((m) => ({ default: m.AdminFundacionesPage })),
)
const AdminConvocatoriasPage = lazy(() =>
  import('@/pages/admin/AdminConvocatoriasPage').then((m) => ({
    default: m.AdminConvocatoriasPage,
  })),
)
const AdminPostulacionesPage = lazy(() =>
  import('@/pages/admin/AdminPostulacionesPage').then((m) => ({
    default: m.AdminPostulacionesPage,
  })),
)
const AdminVoluntariosPage = lazy(() =>
  import('@/pages/admin/AdminVoluntariosPage').then((m) => ({
    default: m.AdminVoluntariosPage,
  })),
)
const AdminCatalogosPage = lazy(() =>
  import('@/pages/admin/AdminCatalogosPage').then((m) => ({ default: m.AdminCatalogosPage })),
)

function SuspenseFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-solar-50 dark:bg-ink-950">
      <div className="animate-pulse">
        <Logo size={44} />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<SuspenseFallback />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

            {/* Rutas solo para invitados */}
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/registro" element={<RegisterPage />} />
              <Route path="/recuperar" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
            </Route>

            {/* App protegida con layout */}
            <Route element={<ProtectedRoute />}>
              <Route path="/app" element={<AppLayout />}>
                <Route index element={<DashboardHome />} />
                <Route path="perfil" element={<CompletarPerfilPage />} />
                <Route path="convocatorias" element={<ExplorarPage />} />
                <Route path="convocatorias/nueva" element={<CrearConvocatoriaPage />} />
                <Route path="convocatorias/:id/editar" element={<CrearConvocatoriaPage />} />
                <Route path="convocatorias/:id" element={<ConvocatoriaDetallePage />} />
                <Route path="convocatorias/:id/postulaciones" element={<PostulacionesPage />} />
                <Route path="mis-convocatorias" element={<MisConvocatoriasPage />} />
                <Route path="mis-postulaciones" element={<MisPostulacionesPage />} />
                <Route path="favoritos" element={<FavoritosPage />} />
                <Route path="intereses" element={<InteresesPage />} />
                <Route path="logros" element={<LogrosPage />} />
                <Route path="ranking" element={<RankingPage />} />
                <Route path="trayectoria" element={<TrayectoriaPage />} />
                <Route path="soporte" element={<SoportePage />} />
                <Route path="habilidades" element={<HabilidadesPage />} />
                <Route path="programaciones" element={<ProgramacionesPage />} />
                <Route path="ofrecimientos" element={<OfrecimientosPage />} />
                <Route path="solicitudes-interes" element={<SolicitudesInteresPage />} />
                <Route path="organizaciones/:id" element={<OrganizacionPublicaPage />} />
                <Route path="perfil-publico" element={<PerfilPublicoPage />} />
                <Route path="notificaciones" element={<NotificacionesPage />} />
              </Route>
            </Route>

            {/* Panel de administración (solo rol ADMIN) */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="usuarios" element={<AdminUsuariosPage />} />
                <Route path="voluntarios" element={<AdminVoluntariosPage />} />
                <Route path="fundaciones" element={<AdminFundacionesPage />} />
                <Route path="convocatorias" element={<AdminConvocatoriasPage />} />
                <Route path="postulaciones" element={<AdminPostulacionesPage />} />
                <Route path="catalogos" element={<AdminCatalogosPage />} />
                <Route path="gestion" element={<AdminGestionPage />} />
              </Route>
            </Route>

            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}
