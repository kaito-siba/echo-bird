import { useMutation } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { LockIcon, UserIcon } from '../components/icons/LoginIcons';
import {
  type LoginRequest,
  login,
  setAuthToken,
} from '../integrations/tanstack-query/queries/auth';
import {
  errorMessage,
  formContainer,
  formGroup,
  formInput,
  formLabel,
  inputContainer,
  inputIconWrapper,
  loadingSpinner,
  loginButton,
  loginCard,
  loginContainer,
  loginTitle,
  serviceName,
  successMessage,
} from '../styles/login.css';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // ログインのミューテーション
  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      // ログイン成功時: トークンを保存してリダイレクト
      setAuthToken(data.access_token);

      // 保存されたリダイレクト先があればそこへ、なければタイムラインへリダイレクト
      const redirectPath = sessionStorage.getItem('redirectAfterLogin');
      if (redirectPath) {
        sessionStorage.removeItem('redirectAfterLogin');
        window.location.href = redirectPath;
      } else {
        navigate({ to: '/timeline' });
      }
    },
    onError: (error) => {
      // エラーハンドリングはミューテーションのerrorプロパティで自動的に管理される
      console.error('Login failed:', error);
    },
  });

  // フォーム送信処理
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // バリデーション
    if (!username.trim() || !password.trim()) {
      return;
    }

    const loginData: LoginRequest = {
      username: username.trim(),
      password: password.trim(),
    };

    loginMutation.mutate(loginData);
  };

  // 入力フィールドの無効化条件
  const isDisabled = loginMutation.isPending;

  return (
    <div className={loginContainer}>
      <h1 className={serviceName}>Echo Bird</h1>
      <div className={loginCard}>
        <h2 className={loginTitle}>ログイン</h2>

        <form onSubmit={handleSubmit} className={formContainer}>
          <div className={formGroup}>
            <label htmlFor="username" className={formLabel}>
              ユーザー名
            </label>
            <div className={inputContainer}>
              <div className={inputIconWrapper}>
                <UserIcon className="icon" />
              </div>
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
          </div>

          <div className={formGroup}>
            <label htmlFor="password" className={formLabel}>
              パスワード
            </label>
            <div className={inputContainer}>
              <div className={inputIconWrapper}>
                <LockIcon className="icon" />
              </div>
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
                <span className={loadingSpinner} />
                <span style={{ marginLeft: '0.5rem' }}>ログイン中...</span>
              </>
            ) : (
              'ログイン'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
