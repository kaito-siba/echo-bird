import { queryOptions } from '@tanstack/react-query'
import { apiClientJson } from '../../../lib/api-client'

// サーバー側のUserResponseインターフェースと同じ構造
interface User {
  id: number
  username: string
  is_active: boolean
  is_admin: boolean
  created_at: number // Unix timestamp
  updated_at: number // Unix timestamp
}

// APIクライアント関数
async function fetchUsers(): Promise<User[]> {
  return apiClientJson<User[]>('/users', {
    method: 'GET',
  })
}

// TanStack Query options
export const userListQueryOptions = queryOptions({
  queryKey: ['users'],
  queryFn: fetchUsers,
  staleTime: 5 * 60 * 1000, // 5分間キャッシュ
  retry: 2,
})

export type { User }