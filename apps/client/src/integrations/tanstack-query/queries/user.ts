import { queryOptions } from '@tanstack/react-query'
import { getAuthToken } from './auth'

// サーバー側のUserResponseインターフェースと同じ構造
interface User {
  id: number
  username: string
  is_active: boolean
  is_admin: boolean
  created_at: number // Unix timestamp
  updated_at: number // Unix timestamp
}

// APIエラーレスポンスの型定義
interface ApiError {
  detail: string
}

// APIベースURL（Viteプロキシ設定により相対パスを使用）
const API_BASE_URL = '/api/v1'

// APIクライアント関数
async function fetchUsers(): Promise<User[]> {
  const token = getAuthToken()

  if (!token) {
    throw new Error('認証トークンが見つかりません')
  }

  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const errorData: ApiError = await response.json()
    throw new Error(errorData.detail || 'ユーザー一覧の取得に失敗しました')
  }

  return response.json()
}

// TanStack Query options
export const userListQueryOptions = queryOptions({
  queryKey: ['users'],
  queryFn: fetchUsers,
  staleTime: 5 * 60 * 1000, // 5分間キャッシュ
  retry: 2,
})

export type { User }