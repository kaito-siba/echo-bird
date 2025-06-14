import { queryOptions } from '@tanstack/react-query'

// API レスポンス型定義
interface LoginRequest {
  username: string
  password: string
}

interface TokenResponse {
  access_token: string
  token_type: string
}

interface UserMeResponse {
  id: number
  username: string
  is_active: boolean
  is_admin: boolean
  created_at: number
  updated_at: number
}

interface ApiError {
  detail: string
}

// APIベースURL（Viteプロキシ設定により相対パスを使用）
const API_BASE_URL = '/api/v1'

// 認証トークンの管理
export const getAuthToken = (): string | null => {
  return localStorage.getItem('token')
}

export const setAuthToken = (token: string): void => {
  localStorage.setItem('token', token)
}

export const removeAuthToken = (): void => {
  localStorage.removeItem('token')
}

// ログインAPI
export const login = async (credentials: LoginRequest): Promise<TokenResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    const errorData: ApiError = await response.json()
    throw new Error(errorData.detail || 'ログインに失敗しました')
  }

  return response.json()
}

// 現在のユーザー情報取得API
const fetchCurrentUser = async (): Promise<UserMeResponse> => {
  const token = getAuthToken()

  if (!token) {
    throw new Error('認証トークンが見つかりません')
  }

  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const errorData: ApiError = await response.json()
    throw new Error(errorData.detail || 'ユーザー情報の取得に失敗しました')
  }

  return response.json()
}

// TanStack Query options
export const currentUserQueryOptions = queryOptions({
  queryKey: ['auth', 'current-user'],
  queryFn: fetchCurrentUser,
  staleTime: 5 * 60 * 1000, // 5分間キャッシュ
  retry: false, // 認証エラーの場合はリトライしない
})

export type { LoginRequest, TokenResponse, UserMeResponse }