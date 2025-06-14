import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import {
  useSuspenseQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
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
  errorMessage,
  mutationErrorContainer,
} from '../styles/admin-form.css';
import { authGuard } from '../utils/auth-guard';
import {
  userDetailQueryOptions,
  updateUser,
  type UserUpdateRequest,
} from '../integrations/tanstack-query/queries/user';

export const Route = createFileRoute('/admin/users/$userId')({
  component: UserEdit,
  beforeLoad: authGuard,
  loader: ({ context, params }) => {
    return context.queryClient.ensureQueryData(
      userDetailQueryOptions(params.userId),
    );
  },
});

function UserEdit() {
  const { userId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // APIからユーザーデータを取得
  const { data: userData } = useSuspenseQuery(userDetailQueryOptions(userId));

  const [formData, setFormData] = useState({
    username: userData.username,
    is_active: userData.is_active,
    is_admin: userData.is_admin,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ユーザー更新のミューテーション
  const updateUserMutation = useMutation({
    mutationFn: (data: UserUpdateRequest) => updateUser(userId, data),
    onSuccess: () => {
      // キャッシュを無効化して最新データを取得
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', userId] });

      // 一覧画面に戻る
      navigate({ to: '/admin/users' });
    },
    onError: (error) => {
      console.error('User update failed:', error);
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

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // APIを呼び出してユーザー情報を更新
    const updateData: UserUpdateRequest = {
      username: formData.username,
      is_active: formData.is_active,
      is_admin: formData.is_admin,
    };

    updateUserMutation.mutate(updateData);
  };

  const handleCancel = () => {
    navigate({ to: '/admin/users' });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('ja-JP');
  };

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
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
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
              onChange={(e) =>
                setFormData({ ...formData, is_active: e.target.checked })
              }
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
              onChange={(e) =>
                setFormData({ ...formData, is_admin: e.target.checked })
              }
              className={checkbox}
            />
            管理者権限
          </label>
        </div>

        <div className={formGroup}>
          <p className={label}>作成日時: {formatDate(userData.created_at)}</p>
          <p className={label}>更新日時: {formatDate(userData.updated_at)}</p>
        </div>

        {/* ミューテーションエラーの表示 */}
        {updateUserMutation.error && (
          <div className={mutationErrorContainer}>
            更新エラー: {updateUserMutation.error.message}
          </div>
        )}

        <div className={buttonGroup}>
          <button
            type="submit"
            className={saveButton}
            disabled={updateUserMutation.isPending}
          >
            {updateUserMutation.isPending ? '保存中...' : '保存'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className={cancelButton}
            disabled={updateUserMutation.isPending}
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
}
