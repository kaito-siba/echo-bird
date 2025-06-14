import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import {
  formContainer,
  formHeader,
  formGroup,
  label,
  input,
  checkbox,
  buttonGroup,
  saveButton,
  cancelButton,
  errorMessage
} from '../styles/admin-form.css'

interface User {
  id: number
  username: string
  is_active: boolean
  is_admin: boolean
  created_at: number
  updated_at: number
}

// Mock data - in a real app, this would come from an API
const mockUsers: Record<string, User> = {
  '1': {
    id: 1,
    username: 'admin',
    is_active: true,
    is_admin: true,
    created_at: 1700000000,
    updated_at: 1700000000,
  },
  '2': {
    id: 2,
    username: 'user1',
    is_active: true,
    is_admin: false,
    created_at: 1700100000,
    updated_at: 1700100000,
  },
  '3': {
    id: 3,
    username: 'user2',
    is_active: false,
    is_admin: false,
    created_at: 1700200000,
    updated_at: 1700200000,
  },
}

export const Route = createFileRoute('/admin/users/$userId')({
  component: UserEdit,
})

function UserEdit() {
  const { userId } = Route.useParams()
  const navigate = useNavigate()

  // Get user data from mock
  const userData = mockUsers[userId]

  if (!userData) {
    return <div>ユーザーが見つかりません</div>
  }

  const [formData, setFormData] = useState({
    username: userData.username,
    is_active: userData.is_active,
    is_admin: userData.is_admin,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    const newErrors: Record<string, string> = {}

    if (!formData.username.trim()) {
      newErrors.username = 'ユーザー名は必須です'
    }

    if (formData.username.length > 100) {
      newErrors.username = 'ユーザー名は100文字以内で入力してください'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Mock save - in a real app, this would call an API
    alert(`ユーザー情報を更新しました: ${JSON.stringify(formData)}`)
    navigate({ to: '/admin/users' })
  }

  const handleCancel = () => {
    navigate({ to: '/admin/users' })
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('ja-JP')
  }

  return (
    <div className={formContainer}>
      <div className={formHeader}>
        <h1>ユーザー編集</h1>
        <p>ID: {userData.id}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={formGroup}>
          <label htmlFor="username" className={label}>
            ユーザー名
          </label>
          <input
            id="username"
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className={input}
          />
          {errors.username && (
            <span className={errorMessage}>{errors.username}</span>
          )}
        </div>

        <div className={formGroup}>
          <label className={label}>
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className={checkbox}
            />
            アクティブ
          </label>
        </div>

        <div className={formGroup}>
          <label className={label}>
            <input
              type="checkbox"
              checked={formData.is_admin}
              onChange={(e) => setFormData({ ...formData, is_admin: e.target.checked })}
              className={checkbox}
            />
            管理者権限
          </label>
        </div>

        <div className={formGroup}>
          <p className={label}>作成日時: {formatDate(userData.created_at)}</p>
          <p className={label}>更新日時: {formatDate(userData.updated_at)}</p>
        </div>

        <div className={buttonGroup}>
          <button type="submit" className={saveButton}>
            保存
          </button>
          <button type="button" onClick={handleCancel} className={cancelButton}>
            キャンセル
          </button>
        </div>
      </form>
    </div>
  )
}