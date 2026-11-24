import { api } from '@/lib/apiClient'
import type {
  LoginPayload,
  LoginResult,
  MfaRequeridoResponse,
  RegisterFoundationPayload,
  RegisterVolunteerPayload,
  TokenResponse,
  Usuario,
} from '@/types/auth'

/** Indica si el login quedó pendiente del segundo paso (verificación en dos pasos). */
export function esMfaRequerido(data: LoginResult): data is MfaRequeridoResponse {
  return 'mfa_requerido' in data && data.mfa_requerido === true
}

export const authService = {
  async login(payload: LoginPayload): Promise<LoginResult> {
    const { data } = await api.post<LoginResult>('/auth/login', payload)
    return data
  },

  /** Segundo paso: código de 6 dígitos de la app autenticadora o código de respaldo. */
  async loginMfa(mfaToken: string, codigo: string): Promise<TokenResponse> {
    const { data } = await api.post<TokenResponse>('/auth/login/mfa', {
      mfa_token: mfaToken,
      codigo,
    })
    return data
  },

  async registerVolunteer(payload: RegisterVolunteerPayload): Promise<TokenResponse> {
    const { data } = await api.post<TokenResponse>('/auth/register/volunteer', payload)
    return data
  },

  async registerFoundation(payload: RegisterFoundationPayload): Promise<TokenResponse> {
    const { data } = await api.post<TokenResponse>('/auth/register/foundation', payload)
    return data
  },

  async me(): Promise<Usuario> {
    const { data } = await api.get<Usuario>('/auth/me')
    return data
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  },

  async verifyEmail(token: string): Promise<{ message: string }> {
    const { data } = await api.get<{ message: string }>(
      `/auth/verify-email/${encodeURIComponent(token)}`,
    )
    return data
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>('/auth/forgot-password', { email })
    return data
  },

  async resetPassword(payload: {
    token: string
    password: string
    password_confirmation: string
  }): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>('/auth/reset-password', payload)
    return data
  },

  async loginWithGoogle(idToken: string, rol?: 'VOLUNTARIO' | 'FUNDACION'): Promise<LoginResult> {
    const { data } = await api.post<LoginResult>('/auth/google', {
      id_token: idToken,
      ...(rol ? { rol } : {}),
    })
    return data
  },
}
