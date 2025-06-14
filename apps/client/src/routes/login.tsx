import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import {
  loginContainer,
  loginCard,
  loginTitle,
  formGroup,
  formLabel,
  formInput,
  loginButton,
  errorMessage,
  successMessage,
  loadingSpinner,
} from '../styles/login.css'
import { login, setAuthToken, type LoginRequest } from '../integrations/tanstack-query/queries/auth'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // ログインのミューテーション
  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      // ログイン成功時: トークンを保存してリダイレクト
      setAuthToken(data.access_token)

      // 管理者画面へリダイレクト（または適切なホームページへ）
      navigate({ to: '/admin/users' })
    },
    onError: (error) => {
      // エラーハンドリングはミューテーションのerrorプロパティで自動的に管理される
      console.error('Login failed:', error)
    },
  })

  // フォーム送信処理
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // バリデーション
    if (!username.trim() || !password.trim()) {
      return
    }

    const loginData: LoginRequest = {
      username: username.trim(),
      password: password.trim(),
    }

    loginMutation.mutate(loginData)
  }

  // 入力フィールドの無効化条件
  const isDisabled = loginMutation.isPending

  return (
    <div className={loginContainer}>
      <div className={loginCard}>
        <h1 className={loginTitle}>ログイン</h1>

        <form onSubmit={handleSubmit}>
          <div className={formGroup}>
            <label htmlFor="username" className={formLabel}>
              ユーザー名
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={formInput}
              placeholder="ユーザー名を入力してください"
              disabled={isDisabled}
              required
            />
          </div>

          <div className={formGroup}>
            <label htmlFor="password" className={formLabel}>
              パスワード
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={formInput}
              placeholder="パスワードを入力してください"
              disabled={isDisabled}
              required
            />
          </div>

          {/* エラーメッセージ表示 */}
          {loginMutation.isError && (
            <div className={errorMessage}>
              {loginMutation.error?.message || 'ログインに失敗しました'}
            </div>
          )}

          {/* 成功メッセージ表示 */}
          {loginMutation.isSuccess && (
            <div className={successMessage}>
              ログインに成功しました。リダイレクトしています...
            </div>
          )}

          <button
            type="submit"
            className={loginButton}
            disabled={isDisabled || !username.trim() || !password.trim()}
          >
            {loginMutation.isPending ? (
              <>
                <span className={loadingSpinner}></span>
                <span style={{ marginLeft: '0.5rem' }}>ログイン中...</span>
              </>
            ) : (
              'ログイン'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}