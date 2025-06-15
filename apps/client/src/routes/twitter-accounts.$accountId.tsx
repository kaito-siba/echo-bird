import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import type { TwitterAccountResponse } from '../integrations/tanstack-query/queries/twitter-account';
import {
  buttonGroup,
  cancelButton,
  checkbox,
  formContainer,
  formGroup,
  formHeader,
  label,
  mutationErrorContainer,
  saveButton,
} from '../styles/admin-form.css';
import { apiClientJson } from '../utils/api-client';
import { authGuard } from '../utils/auth-guard';

// 個別アカウント詳細取得のクエリオプション
const twitterAccountDetailQueryOptions = (accountId: string) => ({
  queryKey: ['twitter-accounts', accountId],
  queryFn: async (): Promise<TwitterAccountResponse> => {
    return apiClientJson<TwitterAccountResponse>(
      `/twitter/accounts/${accountId}`,
      {
        method: 'GET',
      },
    );
  },
  staleTime: 5 * 60 * 1000, // 5分間キャッシュ
  retry: 2,
});

interface TwitterAccountUpdateRequest {
  is_active?: boolean;
}

// アカウント更新 API 関数
async function updateTwitterAccount(
  accountId: string,
  data: TwitterAccountUpdateRequest,
): Promise<TwitterAccountResponse> {
  return apiClientJson<TwitterAccountResponse>(
    `/twitter/accounts/${accountId}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    },
  );
}

// アカウント削除 API 関数
async function deleteTwitterAccount(
  accountId: string,
): Promise<{ success: boolean; message: string }> {
  return apiClientJson(`/twitter/accounts/${accountId}`, {
    method: 'DELETE',
  });
}

// アカウント情報更新 API 関数
async function refreshTwitterAccount(
  accountId: string,
): Promise<TwitterAccountResponse> {
  return apiClientJson<TwitterAccountResponse>(
    `/twitter/accounts/${accountId}/refresh`,
    {
      method: 'PUT',
    },
  );
}

export const Route = createFileRoute('/twitter-accounts/$accountId')({
  component: TwitterAccountDetail,
  beforeLoad: authGuard,
  loader: ({ context, params }) => {
    return context.queryClient.ensureQueryData(
      twitterAccountDetailQueryOptions(params.accountId),
    );
  },
});

function TwitterAccountDetail() {
  const { accountId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // API から Twitter アカウントデータを取得
  const { data: accountData } = useSuspenseQuery(
    twitterAccountDetailQueryOptions(accountId),
  );

  const [formData, setFormData] = useState({
    is_active: accountData.is_active,
  });

  // Twitter アカウント更新のミューテーション
  const updateTwitterAccountMutation = useMutation({
    mutationFn: (data: TwitterAccountUpdateRequest) =>
      updateTwitterAccount(accountId, data),
    onSuccess: () => {
      // キャッシュを無効化して最新データを取得
      queryClient.invalidateQueries({ queryKey: ['twitter-accounts'] });
      queryClient.invalidateQueries({
        queryKey: ['twitter-accounts', accountId],
      });

      // 一覧画面に戻る
      navigate({ to: '/twitter-accounts' });
    },
    onError: (error) => {
      console.error('Twitter account update failed:', error);
    },
  });

  // Twitter アカウント削除のミューテーション
  const deleteTwitterAccountMutation = useMutation({
    mutationFn: () => deleteTwitterAccount(accountId),
    onSuccess: () => {
      // キャッシュを無効化
      queryClient.invalidateQueries({ queryKey: ['twitter-accounts'] });

      // 一覧画面に戻る
      navigate({ to: '/twitter-accounts' });
    },
    onError: (error) => {
      console.error('Twitter account delete failed:', error);
    },
  });

  // Twitter アカウント情報更新のミューテーション
  const refreshTwitterAccountMutation = useMutation({
    mutationFn: () => refreshTwitterAccount(accountId),
    onSuccess: () => {
      // データを再取得してUIに反映
      queryClient.invalidateQueries({
        queryKey: ['twitter-accounts', accountId],
      });
      queryClient.invalidateQueries({ queryKey: ['twitter-accounts'] });
    },
    onError: (error) => {
      console.error('Twitter account refresh failed:', error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // API を呼び出して Twitter アカウント情報を更新
    const updateData: TwitterAccountUpdateRequest = {
      is_active: formData.is_active,
    };

    updateTwitterAccountMutation.mutate(updateData);
  };

  const handleCancel = () => {
    navigate({ to: '/twitter-accounts' });
  };

  const handleDelete = () => {
    if (
      window.confirm(
        'このTwitterアカウントを削除しますか？この操作は取り消せません。',
      )
    ) {
      deleteTwitterAccountMutation.mutate();
    }
  };

  const handleRefresh = () => {
    refreshTwitterAccountMutation.mutate();
  };

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return '未設定';
    return new Date(timestamp * 1000).toLocaleString('ja-JP');
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ja-JP').format(num);
  };

  const getStatusBadge = (isActive: boolean, status: string) => {
    if (!isActive) {
      return (
        <span
          style={{
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            fontSize: '0.75rem',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
          }}
        >
          非アクティブ
        </span>
      );
    }

    if (status === 'Active') {
      return (
        <span
          style={{
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            fontSize: '0.75rem',
            backgroundColor: '#d1fae5',
            color: '#059669',
          }}
        >
          アクティブ
        </span>
      );
    }

    return (
      <span
        style={{
          padding: '0.25rem 0.5rem',
          borderRadius: '4px',
          fontSize: '0.75rem',
          backgroundColor: '#fef3c7',
          color: '#d97706',
        }}
      >
        {status}
      </span>
    );
  };

  return (
    <div className={formContainer}>
      <div className={formHeader}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1rem',
          }}
        >
          {accountData.profile_image_url && (
            <img
              src={accountData.profile_image_url}
              alt={`@${accountData.username}`}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                objectFit: 'cover',
              }}
            />
          )}
          <div>
            <h1>Twitter アカウント詳細</h1>
            <p>
              @{accountData.username} ({accountData.display_name})
            </p>
          </div>
        </div>
        {getStatusBadge(accountData.is_active, accountData.status)}
      </div>

      {/* プロフィール情報 */}
      <div className={formGroup}>
        <h3 className={label}>プロフィール情報</h3>
        <p className={label}>内部 ID: {accountData.id}</p>
        <p className={label}>Twitter ID: {accountData.twitter_id}</p>
        <p className={label}>ユーザー名: @{accountData.username}</p>
        <p className={label}>表示名: {accountData.display_name}</p>
        {accountData.bio && (
          <p className={label}>プロフィール: {accountData.bio}</p>
        )}
      </div>

      {/* 統計情報 */}
      <div className={formGroup}>
        <h3 className={label}>統計情報</h3>
        <p className={label}>
          フォロワー数: {formatNumber(accountData.followers_count)}
        </p>
        <p className={label}>
          フォロー数: {formatNumber(accountData.following_count)}
        </p>
      </div>

      {/* 日時情報 */}
      <div className={formGroup}>
        <h3 className={label}>日時情報</h3>
        <p className={label}>
          最終ログイン: {formatDate(accountData.last_login_at)}
        </p>
        <p className={label}>作成日時: {formatDate(accountData.created_at)}</p>
        <p className={label}>更新日時: {formatDate(accountData.updated_at)}</p>
      </div>

      {/* 編集可能なフォーム */}
      <form onSubmit={handleSubmit}>
        <div className={formGroup}>
          <h3 className={label}>設定</h3>

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
            }}
          >
            無効にするとこのアカウントはツイート取得に使用されません
          </p>
        </div>

        {/* ミューテーションエラーの表示 */}
        {updateTwitterAccountMutation.error && (
          <div className={mutationErrorContainer}>
            更新エラー: {updateTwitterAccountMutation.error.message}
          </div>
        )}

        {deleteTwitterAccountMutation.error && (
          <div className={mutationErrorContainer}>
            削除エラー: {deleteTwitterAccountMutation.error.message}
          </div>
        )}

        {refreshTwitterAccountMutation.error && (
          <div className={mutationErrorContainer}>
            情報更新エラー: {refreshTwitterAccountMutation.error.message}
          </div>
        )}

        <div className={buttonGroup}>
          <button
            type="submit"
            className={saveButton}
            disabled={updateTwitterAccountMutation.isPending}
          >
            {updateTwitterAccountMutation.isPending ? '保存中...' : '保存'}
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            className={saveButton}
            disabled={refreshTwitterAccountMutation.isPending}
            style={{ backgroundColor: '#059669' }}
          >
            {refreshTwitterAccountMutation.isPending
              ? '更新中...'
              : 'プロフィール更新'}
          </button>

          <button
            type="button"
            onClick={handleCancel}
            className={cancelButton}
            disabled={
              updateTwitterAccountMutation.isPending ||
              deleteTwitterAccountMutation.isPending ||
              refreshTwitterAccountMutation.isPending
            }
          >
            キャンセル
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className={cancelButton}
            disabled={
              updateTwitterAccountMutation.isPending ||
              deleteTwitterAccountMutation.isPending ||
              refreshTwitterAccountMutation.isPending
            }
            style={{
              marginLeft: 'auto',
              backgroundColor: '#dc2626',
              color: 'white',
            }}
          >
            {deleteTwitterAccountMutation.isPending ? '削除中...' : '削除'}
          </button>
        </div>
      </form>
    </div>
  );
}
