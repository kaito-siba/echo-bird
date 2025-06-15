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

export const Route = createFileRoute('/admin/users/create')({
  component: UserCreate,
  beforeLoad: authGuard,
});

function UserCreate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ユーザー作成のミューテーション
  const createUserMutation = useMutation({
    mutationFn: (data: UserCreateRequest) => createUser(data),
    onSuccess: () => {
      // キャッシュを無効化して最新データを取得
      queryClient.invalidateQueries({ queryKey: ['users'] });

      // 一覧画面に戻る
      navigate({ to: '/admin/users' });
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

    if (formData.username.length > 100) {
      newErrors.username = 'ユーザー名は100文字以内で入力してください';
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

    // APIを呼び出してユーザーを作成
    const createData: UserCreateRequest = {
      username: formData.username,
      password: formData.password,
    };

    createUserMutation.mutate(createData);
  };

  const handleCancel = () => {
    navigate({ to: '/admin/users' });
  };

  return (
    <div className={formContainer}>
      <div className={formHeader}>
        <h1>新しいユーザーを作成</h1>
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
            placeholder="ユーザー名を入力してください"
          />
          {errors.username && (
            <span className={errorMessage}>{errors.username}</span>
          )}
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
            placeholder="パスワードを入力してください（8文字以上）"
          />
          {errors.password && (
            <span className={errorMessage}>{errors.password}</span>
          )}
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
            {createUserMutation.isPending ? '作成中...' : '作成'}
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
