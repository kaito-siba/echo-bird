import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import {
  type UserUpdateRequest,
  deleteUser,
  updateUser,
  userDetailQueryOptions,
} from '../integrations/tanstack-query/queries/user';
import {
  buttonGroup,
  cancelButton,
  checkbox,
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

export const Route = createFileRoute('/users/$userId')({
  component: UserDetail,
  beforeLoad: authGuard,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      returnTab: (search.returnTab as string) || 'echobird',
    };
  },
  loader: ({ context, params }) => {
    return context.queryClient.ensureQueryData(
      userDetailQueryOptions(params.userId),
    );
  },
});

function UserDetail() {
  const { userId } = Route.useParams();
  const { returnTab } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // API から EchoBird ユーザーデータを取得
  const { data: userData } = useSuspenseQuery(userDetailQueryOptions(userId));

  const [formData, setFormData] = useState({
    username: userData.username,
    is_active: userData.is_active,
    is_admin: userData.is_admin,
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // EchoBird ユーザー更新のミューテーション
  const updateUserMutation = useMutation({
    mutationFn: (data: UserUpdateRequest) => updateUser(userId, data),
    onSuccess: () => {
      // キャッシュを無効化して最新データを取得
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({
        queryKey: ['users', userId],
      });

      // パスワードフィールドをクリア（セキュリティのため）
      setFormData((prev) => ({
        ...prev,
        newPassword: '',
        confirmPassword: '',
      }));

      // エラーメッセージをクリア
      setErrors({});

      // アカウント管理画面に戻る（適切なタブを指定）
      navigate({
        to: '/account-management',
        search: { tab: returnTab },
      });
    },
    onError: (error) => {
      console.error('User update failed:', error);
    },
  });

  // EchoBird ユーザー削除のミューテーション
  const deleteUserMutation = useMutation({
    mutationFn: () => deleteUser(userId),
    onSuccess: () => {
      // キャッシュを無効化
      queryClient.invalidateQueries({ queryKey: ['users'] });

      // アカウント管理画面に戻る（適切なタブを指定）
      navigate({
        to: '/account-management',
        search: { tab: returnTab },
      });
    },
    onError: (error) => {
      console.error('User delete failed:', error);
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

    // パスワード変更時のバリデーション
    if (formData.newPassword.trim()) {
      if (formData.newPassword.length < 8) {
        newErrors.newPassword = 'パスワードは8文字以上で入力してください';
      }

      if (!formData.confirmPassword.trim()) {
        newErrors.confirmPassword = 'パスワード確認は必須です';
      }

      if (
        formData.newPassword.trim() &&
        formData.confirmPassword.trim() &&
        formData.newPassword !== formData.confirmPassword
      ) {
        newErrors.confirmPassword = 'パスワードが一致しません';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // API を呼び出して EchoBird ユーザー情報を更新
    const updateData: UserUpdateRequest = {
      username: formData.username,
      is_active: formData.is_active,
      is_admin: formData.is_admin,
    };

    // パスワード変更が指定されている場合は含める
    if (formData.newPassword.trim()) {
      updateData.password = formData.newPassword.trim();
    }

    updateUserMutation.mutate(updateData);
  };

  const handleCancel = () => {
    navigate({
      to: '/account-management',
      search: { tab: returnTab },
    });
  };

  const handleDelete = () => {
    if (
      window.confirm(
        'このEchoBirdユーザーを削除しますか？この操作は取り消せません。',
      )
    ) {
      deleteUserMutation.mutate();
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('ja-JP');
  };

  const getStatusBadge = (isActive: boolean, isAdmin: boolean) => {
    let statusText = '一般ユーザー';
    let bgColor = '#e5e7eb';
    let textColor = '#374151';

    if (isAdmin) {
      statusText = '管理者';
      bgColor = '#dbeafe';
      textColor = '#1e40af';
    } else if (isActive) {
      statusText = 'アクティブユーザー';
      bgColor = '#d1fae5';
      textColor = '#059669';
    } else {
      statusText = '非アクティブユーザー';
      bgColor = '#fee2e2';
      textColor = '#dc2626';
    }

    return (
      <span
        style={{
          padding: '0.25rem 0.5rem',
          borderRadius: '4px',
          fontSize: '0.75rem',
          backgroundColor: bgColor,
          color: textColor,
        }}
      >
        {statusText}
      </span>
    );
  };

  return (
    <div className={formContainer}>
      <div className={formHeader}>
        <div>
          <h1>EchoBird ユーザー詳細</h1>
          <p>{userData.username} の情報と設定</p>
        </div>
        {getStatusBadge(userData.is_active, userData.is_admin)}
      </div>

      {/* 基本情報 */}
      <div className={formGroup}>
        <h3 className={label}>基本情報</h3>
        <p className={label}>内部 ID: {userData.id}</p>
        <p className={label}>現在のユーザー名: {userData.username}</p>
        <p className={label}>作成日時: {formatDate(userData.created_at)}</p>
        <p className={label}>更新日時: {formatDate(userData.updated_at)}</p>
      </div>

      {/* 編集可能なフォーム */}
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
            placeholder="ユーザー名"
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
          <h3 className={label}>権限設定</h3>

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
          <p
            style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              marginTop: '0.25rem',
              marginBottom: '1rem',
            }}
          >
            無効にするとこのユーザーはログインできなくなります
          </p>

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
          <p
            style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              marginTop: '0.25rem',
            }}
          >
            有効にするとこのユーザーは管理者機能にアクセスできるようになります
          </p>
        </div>

        <div className={formGroup}>
          <h3 className={label}>パスワード変更（オプション）</h3>
          <label htmlFor="newPassword" className={label}>
            新しいパスワード
          </label>
          <input
            id="newPassword"
            type="password"
            value={formData.newPassword}
            onChange={(e) =>
              setFormData({ ...formData, newPassword: e.target.value })
            }
            className={input}
            placeholder="新しいパスワード（変更する場合のみ）"
          />
          {errors.newPassword && (
            <span className={errorMessage}>{errors.newPassword}</span>
          )}

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
            placeholder="新しいパスワードの確認"
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
            パスワードを変更しない場合は、これらのフィールドを空のままにしてください
          </p>
        </div>

        {/* セキュリティ警告 */}
        <div
          style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '1.5rem',
          }}
        >
          <h4 style={{ margin: '0 0 8px 0', color: '#92400e' }}>
            重要な注意事項
          </h4>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#92400e' }}>
            <li>
              管理者権限を持つユーザーは、すべてのシステム機能にアクセスできます
            </li>
            <li>
              ユーザーを非アクティブにすると、そのユーザーはログインできなくなります
            </li>
            <li>ユーザーの削除は取り消せません。慎重に実行してください</li>
          </ul>
        </div>

        {/* ミューテーションエラーの表示 */}
        {updateUserMutation.error && (
          <div className={mutationErrorContainer}>
            更新エラー: {updateUserMutation.error.message}
          </div>
        )}

        {deleteUserMutation.error && (
          <div className={mutationErrorContainer}>
            削除エラー: {deleteUserMutation.error.message}
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
            disabled={
              updateUserMutation.isPending || deleteUserMutation.isPending
            }
          >
            キャンセル
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className={cancelButton}
            disabled={
              updateUserMutation.isPending || deleteUserMutation.isPending
            }
            style={{
              marginLeft: 'auto',
              backgroundColor: '#dc2626',
              color: 'white',
            }}
          >
            {deleteUserMutation.isPending ? '削除中...' : 'ユーザー削除'}
          </button>
        </div>
      </form>
    </div>
  );
}
