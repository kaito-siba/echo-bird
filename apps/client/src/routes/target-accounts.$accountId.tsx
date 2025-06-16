import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import {
  type TargetAccountUpdateRequest,
  deleteTargetAccount,
  fetchTweetsForAccount,
  targetAccountDetailQueryOptions,
  updateTargetAccount,
} from '../integrations/tanstack-query/queries/target-account';
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

export const Route = createFileRoute('/target-accounts/$accountId')({
  component: TargetAccountDetail,
  beforeLoad: authGuard,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      returnTab: (search.returnTab as string) || 'target',
    };
  },
  loader: ({ context, params }) => {
    return context.queryClient.ensureQueryData(
      targetAccountDetailQueryOptions(params.accountId),
    );
  },
});

function TargetAccountDetail() {
  const { accountId } = Route.useParams();
  const { returnTab } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // API からターゲットアカウントデータを取得
  const { data: accountData } = useSuspenseQuery(
    targetAccountDetailQueryOptions(accountId),
  );

  const [formData, setFormData] = useState({
    is_active: accountData.is_active,
    fetch_interval_minutes: accountData.fetch_interval_minutes,
    max_tweets_per_fetch: accountData.max_tweets_per_fetch,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ターゲットアカウント更新のミューテーション
  const updateTargetAccountMutation = useMutation({
    mutationFn: (data: TargetAccountUpdateRequest) =>
      updateTargetAccount(accountId, data),
    onSuccess: () => {
      // キャッシュを無効化して最新データを取得
      queryClient.invalidateQueries({ queryKey: ['target-accounts'] });
      queryClient.invalidateQueries({
        queryKey: ['target-accounts', accountId],
      });

      // アカウント管理画面に戻る（適切なタブを指定）
      navigate({
        to: '/account-management',
        search: { tab: returnTab },
      });
    },
    onError: (error) => {
      console.error('Target account update failed:', error);
    },
  });

  // ターゲットアカウント削除のミューテーション
  const deleteTargetAccountMutation = useMutation({
    mutationFn: () => deleteTargetAccount(accountId),
    onSuccess: () => {
      // キャッシュを無効化
      queryClient.invalidateQueries({ queryKey: ['target-accounts'] });

      // アカウント管理画面に戻る（適切なタブを指定）
      navigate({
        to: '/account-management',
        search: { tab: returnTab },
      });
    },
    onError: (error) => {
      console.error('Target account delete failed:', error);
    },
  });

  // ツイート取得実行のミューテーション
  const fetchTweetsMutation = useMutation({
    mutationFn: () => fetchTweetsForAccount(accountId),
    onSuccess: () => {
      // データを再取得してUIに反映
      queryClient.invalidateQueries({
        queryKey: ['target-accounts', accountId],
      });
    },
    onError: (error) => {
      console.error('Tweet fetch failed:', error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // フォーム バリデーション
    const newErrors: Record<string, string> = {};

    if (formData.fetch_interval_minutes < 1) {
      newErrors.fetch_interval_minutes = '取得間隔は1分以上で設定してください';
    }

    if (formData.max_tweets_per_fetch < 1) {
      newErrors.max_tweets_per_fetch =
        '最大取得ツイート数は1以上で設定してください';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // API を呼び出してターゲットアカウント情報を更新
    const updateData: TargetAccountUpdateRequest = {
      is_active: formData.is_active,
      fetch_interval_minutes: formData.fetch_interval_minutes,
      max_tweets_per_fetch: formData.max_tweets_per_fetch,
    };

    updateTargetAccountMutation.mutate(updateData);
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
        'このターゲットアカウントを削除しますか？この操作は取り消せません。',
      )
    ) {
      deleteTargetAccountMutation.mutate();
    }
  };

  const handleFetchTweets = () => {
    fetchTweetsMutation.mutate();
  };

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return '未設定';
    return new Date(timestamp * 1000).toLocaleString('ja-JP');
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ja-JP').format(num);
  };

  return (
    <div className={formContainer}>
      <div className={formHeader}>
        <h1>ターゲットアカウント詳細</h1>
        <p>
          @{accountData.username} ({accountData.display_name || '表示名なし'})
        </p>
      </div>

      {/* 基本プロフィール情報 */}
      <div className={formGroup}>
        <h3 className={label}>基本情報</h3>
        <p className={label}>内部 ID: {accountData.id}</p>
        <p className={label}>
          Twitter ユーザー ID: {accountData.twitter_user_id}
        </p>
        <p className={label}>ユーザー名: @{accountData.username}</p>
        <p className={label}>表示名: {accountData.display_name || '未設定'}</p>
        <p className={label}>説明: {accountData.description || '未設定'}</p>
        <p className={label}>場所: {accountData.location || '未設定'}</p>
        <p className={label}>
          ウェブサイト:{' '}
          {accountData.url ? (
            <a href={accountData.url} target="_blank" rel="noopener noreferrer">
              {accountData.url}
            </a>
          ) : (
            '未設定'
          )}
        </p>
      </div>

      {/* ステータス情報 */}
      <div className={formGroup}>
        <h3 className={label}>ステータス</h3>
        <p className={label}>
          鍵アカウント: {accountData.is_protected ? 'はい' : 'いいえ'}
        </p>
        <p className={label}>
          認証済み: {accountData.is_verified ? 'はい' : 'いいえ'}
        </p>
        <p className={label}>
          Twitter Blue 認証済み:{' '}
          {accountData.is_blue_verified ? 'はい' : 'いいえ'}
        </p>
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
        <p className={label}>
          ツイート数: {formatNumber(accountData.tweets_count)}
        </p>
        <p className={label}>
          リスト登録数: {formatNumber(accountData.listed_count)}
        </p>
        <p className={label}>
          いいね数: {formatNumber(accountData.favorites_count)}
        </p>
      </div>

      {/* エラー情報 */}
      {(accountData.consecutive_errors > 0 || accountData.last_error) && (
        <div className={formGroup}>
          <h3 className={label}>エラー情報</h3>
          <p className={label}>
            連続エラー回数: {accountData.consecutive_errors}
          </p>
          <p className={label}>
            最後のエラー: {accountData.last_error || '未設定'}
          </p>
          <p className={label}>
            最後のエラー発生日時: {formatDate(accountData.last_error_at)}
          </p>
        </div>
      )}

      {/* 日時情報 */}
      <div className={formGroup}>
        <h3 className={label}>日時情報</h3>
        <p className={label}>
          最終取得日時: {formatDate(accountData.last_fetched_at)}
        </p>
        <p className={label}>
          アカウント作成日時: {formatDate(accountData.account_created_at)}
        </p>
        <p className={label}>
          レコード作成日時: {formatDate(accountData.created_at)}
        </p>
        <p className={label}>
          レコード更新日時: {formatDate(accountData.updated_at)}
        </p>
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
        </div>

        <div className={formGroup}>
          <label htmlFor="fetch_interval_minutes" className={label}>
            取得間隔（分）
          </label>
          <input
            id="fetch_interval_minutes"
            type="number"
            min="1"
            value={formData.fetch_interval_minutes}
            onChange={(e) =>
              setFormData({
                ...formData,
                fetch_interval_minutes: Number(e.target.value),
              })
            }
            className={input}
          />
          {errors.fetch_interval_minutes && (
            <span className={errorMessage}>
              {errors.fetch_interval_minutes}
            </span>
          )}
        </div>

        <div className={formGroup}>
          <label htmlFor="max_tweets_per_fetch" className={label}>
            最大取得ツイート数
          </label>
          <input
            id="max_tweets_per_fetch"
            type="number"
            min="1"
            value={formData.max_tweets_per_fetch}
            onChange={(e) =>
              setFormData({
                ...formData,
                max_tweets_per_fetch: Number(e.target.value),
              })
            }
            className={input}
          />
          {errors.max_tweets_per_fetch && (
            <span className={errorMessage}>{errors.max_tweets_per_fetch}</span>
          )}
        </div>

        {/* ミューテーションエラーの表示 */}
        {updateTargetAccountMutation.error && (
          <div className={mutationErrorContainer}>
            更新エラー: {updateTargetAccountMutation.error.message}
          </div>
        )}

        {deleteTargetAccountMutation.error && (
          <div className={mutationErrorContainer}>
            削除エラー: {deleteTargetAccountMutation.error.message}
          </div>
        )}

        {fetchTweetsMutation.error && (
          <div className={mutationErrorContainer}>
            ツイート取得エラー: {fetchTweetsMutation.error.message}
          </div>
        )}

        <div className={buttonGroup}>
          <button
            type="submit"
            className={saveButton}
            disabled={updateTargetAccountMutation.isPending}
          >
            {updateTargetAccountMutation.isPending ? '保存中...' : '保存'}
          </button>

          <button
            type="button"
            onClick={handleFetchTweets}
            className={saveButton}
            disabled={fetchTweetsMutation.isPending}
          >
            {fetchTweetsMutation.isPending
              ? 'ツイート取得中...'
              : 'ツイート取得実行'}
          </button>

          <button
            type="button"
            onClick={handleCancel}
            className={cancelButton}
            disabled={
              updateTargetAccountMutation.isPending ||
              deleteTargetAccountMutation.isPending ||
              fetchTweetsMutation.isPending
            }
          >
            キャンセル
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className={cancelButton}
            disabled={
              updateTargetAccountMutation.isPending ||
              deleteTargetAccountMutation.isPending ||
              fetchTweetsMutation.isPending
            }
            style={{ marginLeft: 'auto', backgroundColor: '#dc2626' }}
          >
            {deleteTargetAccountMutation.isPending ? '削除中...' : '削除'}
          </button>
        </div>
      </form>
    </div>
  );
}
