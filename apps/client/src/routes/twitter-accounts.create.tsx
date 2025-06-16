import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import {
  type TwitterAuthRequest,
  authenticateTwitterAccount,
} from '../integrations/tanstack-query/queries/twitter-account';
import {
  buttonGroup,
  cancelButton,
  errorMessage,
  formContainer,
  formGroup,
  formHeader,
  input,
  label,
  mutationErrorContainer,
  saveButton,
} from '../styles/admin-form.css';
import { authGuard } from '../utils/auth-guard';

export const Route = createFileRoute('/twitter-accounts/create')({
  component: TwitterAccountCreate,
  beforeLoad: authGuard,
});

function TwitterAccountCreate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Twitter アカウント認証のミューテーション
  const authenticateTwitterMutation = useMutation({
    mutationFn: (data: TwitterAuthRequest) => authenticateTwitterAccount(data),
    onSuccess: (response) => {
      // キャッシュを無効化して最新データを取得
      queryClient.invalidateQueries({ queryKey: ['twitter-accounts'] });

      if (response.success && response.account) {
        // 認証成功時はアカウント管理画面に遷移
        navigate({ to: '/account-management' });
      } else {
        // アカウント管理画面に戻る
        navigate({ to: '/account-management' });
      }
    },
    onError: (error) => {
      console.error('Twitter authentication failed:', error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // フォーム バリデーション
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Twitter ユーザー名は必須です';
    }

    // Twitter ユーザー名の形式チェック
    const usernamePattern = /^@?[a-zA-Z0-9_]{1,15}$/;
    const cleanUsername = formData.username.replace(/^@/, '');
    if (
      formData.username.trim() &&
      !usernamePattern.test(`@${cleanUsername}`)
    ) {
      newErrors.username =
        'Twitter ユーザー名は1-15文字の英数字とアンダースコアのみ使用可能です';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'メールアドレスは必須です';
    }

    // メールアドレスの形式チェック
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email.trim() && !emailPattern.test(formData.email)) {
      newErrors.email = 'メールアドレスの形式が正しくありません';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'パスワードは必須です';
    }

    if (formData.password.length < 8) {
      newErrors.password = 'パスワードは8文字以上で入力してください';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // API を呼び出して Twitter アカウントを認証
    const authData: TwitterAuthRequest = {
      username: cleanUsername, // @マークを除去したユーザー名を送信
      email: formData.email,
      password: formData.password,
    };

    authenticateTwitterMutation.mutate(authData);
  };

  const handleCancel = () => {
    navigate({ to: '/account-management' });
  };

  return (
    <div className={formContainer}>
      <div className={formHeader}>
        <h1>新しい Twitter アカウントを認証</h1>
        <p>Twitter のログイン情報を入力してアカウントを認証します</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={formGroup}>
          <label htmlFor="username" className={label}>
            Twitter ユーザー名
          </label>
          <input
            id="username"
            type="text"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            className={input}
            placeholder="例: @your_username または your_username"
          />
          {errors.username && (
            <span className={errorMessage}>{errors.username}</span>
          )}
          <p
            style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              marginTop: '0.25rem',
            }}
          >
            @ マークは自動で除去されます
          </p>
        </div>

        <div className={formGroup}>
          <label htmlFor="email" className={label}>
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className={input}
            placeholder="Twitter アカウントに登録されているメールアドレス"
          />
          {errors.email && <span className={errorMessage}>{errors.email}</span>}
        </div>

        <div className={formGroup}>
          <label htmlFor="password" className={label}>
            パスワード
          </label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className={input}
            placeholder="Twitter アカウントのパスワード"
          />
          {errors.password && (
            <span className={errorMessage}>{errors.password}</span>
          )}
          <p
            style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              marginTop: '0.25rem',
            }}
          >
            パスワードは暗号化されて安全に保存されます
          </p>
        </div>

        <div
          style={{
            padding: '1rem',
            backgroundColor: '#fef3c7',
            borderRadius: '4px',
            marginBottom: '1rem',
          }}
        >
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#d97706' }}>
            ⚠️ 重要な注意事項
          </h4>
          <ul
            style={{
              margin: 0,
              paddingLeft: '1.5rem',
              fontSize: '0.875rem',
              color: '#92400e',
            }}
          >
            <li>
              Twitter の正式な OAuth
              ではなく、ユーザー名・パスワードでの認証です
            </li>
            <li>
              二段階認証が有効なアカウントでは認証に失敗する可能性があります
            </li>
            <li>
              パスワードは暗号化されますが、セキュリティ上のリスクを理解した上でご使用ください
            </li>
            <li>認証に失敗する場合は、Twitter の設定を確認してください</li>
          </ul>
        </div>

        {/* ミューテーションエラーの表示 */}
        {authenticateTwitterMutation.error && (
          <div className={mutationErrorContainer}>
            認証エラー: {authenticateTwitterMutation.error.message}
          </div>
        )}

        <div className={buttonGroup}>
          <button
            type="submit"
            className={saveButton}
            disabled={authenticateTwitterMutation.isPending}
          >
            {authenticateTwitterMutation.isPending ? '認証中...' : '認証'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className={cancelButton}
            disabled={authenticateTwitterMutation.isPending}
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
}
