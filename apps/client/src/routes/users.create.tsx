import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import {
  type UserCreateRequest,
  createUser,
} from '../integrations/tanstack-query/queries/user';
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

export const Route = createFileRoute('/users/create')({
  component: UserCreate,
  beforeLoad: authGuard,
});

function UserCreate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleCancel = () => {
    navigate({ to: '/account-management' });
  };

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // EchoBirdユーザー作成のミューテーション
  const createUserMutation = useMutation({
    mutationFn: (data: UserCreateRequest) => createUser(data),
    onSuccess: () => {
      // キャッシュを無効化して最新データを取得
      queryClient.invalidateQueries({ queryKey: ['users'] });

      // 作成に成功した場合、アカウント管理画面に遷移
      navigate({ to: '/account-management' });
    },
    onError: (error) => {
      console.error('User creation failed:', error);
      // エラーメッセージの表示はミューテーションのerrorプロパティで管理される
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // フォーム バリデーション
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'ユーザー名は必須です';
    }

    // ユーザー名の形式チェック（英数字とアンダースコア、ハイフンのみ）
    const usernamePattern = /^[a-zA-Z0-9_-]{3,20}$/;
    if (formData.username.trim() && !usernamePattern.test(formData.username)) {
      newErrors.username =
        'ユーザー名は3-20文字の英数字、アンダースコア、ハイフンのみ使用可能です';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'パスワードは必須です';
    }

    if (formData.password.trim() && formData.password.length < 8) {
      newErrors.password = 'パスワードは8文字以上で入力してください';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'パスワード確認は必須です';
    }

    if (
      formData.password.trim() &&
      formData.confirmPassword.trim() &&
      formData.password !== formData.confirmPassword
    ) {
      newErrors.confirmPassword = 'パスワードが一致しません';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // API を呼び出して EchoBird ユーザーを作成
    const createData: UserCreateRequest = {
      username: formData.username,
      password: formData.password,
    };

    createUserMutation.mutate(createData);
  };

  return (
    <div className={formContainer}>
      <div className={formHeader}>
        <h1>新しい EchoBird ユーザーを作成</h1>
        <p>
          EchoBird
          システムの新しいユーザーアカウントを作成します。作成されたユーザーは、このシステムにログインしてツイートの閲覧や管理を行うことができます。
        </p>
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
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            className={input}
            placeholder="例: john_doe"
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
            3-20文字の英数字、アンダースコア（_）、ハイフン（-）が使用可能です
          </p>
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
            placeholder="8文字以上のパスワード"
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
            8文字以上で設定してください。セキュリティのため、英数字と記号を組み合わせることを推奨します。
          </p>
        </div>

        <div className={formGroup}>
          <label htmlFor="confirmPassword" className={label}>
            パスワード確認
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
            className={input}
            placeholder="上記と同じパスワードを入力"
          />
          {errors.confirmPassword && (
            <span className={errorMessage}>{errors.confirmPassword}</span>
          )}
          <p
            style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              marginTop: '0.25rem',
            }}
          >
            確認のため、上記と同じパスワードを入力してください
          </p>
        </div>

        {/* ユーザー権限に関する情報 */}
        <div
          style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #3b82f6',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '1.5rem',
          }}
        >
          <h4 style={{ margin: '0 0 8px 0', color: '#1e40af' }}>
            ユーザー権限について
          </h4>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#1e40af' }}>
            <li>作成されるユーザーは、通常の一般ユーザー権限を持ちます</li>
            <li>管理者権限の付与は、作成後に別途設定が必要です</li>
            <li>
              ユーザーはログイン後、ツイートの閲覧、ブックマーク、タイムライン管理などが可能です
            </li>
          </ul>
        </div>

        {/* ミューテーションエラーの表示 */}
        {createUserMutation.error && (
          <div className={mutationErrorContainer}>
            作成エラー: {createUserMutation.error.message}
          </div>
        )}

        <div className={buttonGroup}>
          <button
            type="submit"
            className={saveButton}
            disabled={createUserMutation.isPending}
          >
            {createUserMutation.isPending ? '作成中...' : 'ユーザーを作成'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className={cancelButton}
            disabled={createUserMutation.isPending}
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
}
