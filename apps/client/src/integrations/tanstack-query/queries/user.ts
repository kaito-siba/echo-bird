import { queryOptions } from '@tanstack/react-query';
import { apiClientJson } from '../../../utils/api-client';

// サーバー側のUserResponseインターフェースと同じ構造
interface User {
  id: number;
  username: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: number; // Unix timestamp
  updated_at: number; // Unix timestamp
}

// APIクライアント関数
async function fetchUsers(): Promise<User[]> {
  return apiClientJson<User[]>('/users', {
    method: 'GET',
  });
}

async function fetchUser(userId: string): Promise<User> {
  return apiClientJson<User>(`/users/${userId}`, {
    method: 'GET',
  });
}

interface UserUpdateRequest {
  username?: string;
  is_active?: boolean;
  is_admin?: boolean;
}

interface UserCreateRequest {
  username: string;
  password: string;
}

async function createUser(data: UserCreateRequest): Promise<User> {
  return apiClientJson<User>('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

async function updateUser(
  userId: string,
  data: UserUpdateRequest,
): Promise<User> {
  return apiClientJson<User>(`/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

async function deleteUser(userId: string): Promise<void> {
  return apiClientJson(`/users/${userId}`, {
    method: 'DELETE',
  });
}

// TanStack Query options
export const userListQueryOptions = queryOptions({
  queryKey: ['users'],
  queryFn: fetchUsers,
  staleTime: 5 * 60 * 1000, // 5分間キャッシュ
  retry: 2,
});

export const userDetailQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ['users', userId],
    queryFn: () => fetchUser(userId),
    staleTime: 5 * 60 * 1000, // 5分間キャッシュ
    retry: 2,
  });

export type { User, UserUpdateRequest, UserCreateRequest };
export { updateUser, createUser, deleteUser };
