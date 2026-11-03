import { api } from '@/lib/apiClient'
import type {
  LoginPayload,
  RegisterFoundationPayload,
  RegisterVolunteerPayload,
  TokenResponse,
  Usuario,
} from '@/types/auth'

export const authService = {
  async login(payload: LoginPayload): Promise<TokenResponse> {
    const { data } = await api.post<TokenResponse>('/auth/login', payload)
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

  async loginWithGoogle(idToken: string, rol?: 'VOLUNTARIO' | 'FUNDACION'): Promise<TokenResponse> {
    const { data } = await api.post<TokenResponse>('/auth/google', {
      id_token: idToken,
      ...(rol ? { rol } : {}),
    })
    return data
  },
}
