import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import {
  formContainer,
  formHeader,
  formGroup,
  label,
  input,
  select,
  buttonGroup,
  saveButton,
  cancelButton,
  errorMessage,
  mutationErrorContainer,
} from '../styles/admin-form.css';
import { errorContainer } from '../styles/admin.css';
import { authGuard } from '../utils/auth-guard';
import {
  createTargetAccount,
  type TargetAccountCreateRequest,
} from '../integrations/tanstack-query/queries/target-account';
import { twitterAccountListQueryOptions } from '../integrations/tanstack-query/queries/twitter-account';

export const Route = createFileRoute('/target-accounts/create')({
  component: TargetAccountCreate,
  beforeLoad: authGuard,
  loader: ({ context }) => {
    // Twitter アカウント一覧を事前に取得
    return context.queryClient.ensureQueryData(twitterAccountListQueryOptions);
  },
});

function TargetAccountCreate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleCancel = () => {
    navigate({ to: '/target-accounts' });
  };

  // 認証済み Twitter アカウント一覧を取得
  const { data: twitterAccountsData, error: twitterAccountsError } =
    useSuspenseQuery(twitterAccountListQueryOptions);

  // エラーハンドリング
  if (twitterAccountsError) {
    return (
      <div className={formContainer}>
        <div className={formHeader}>
          <h1>新しいターゲットアカウントを追加</h1>
        </div>
        <div className={errorContainer}>
          認証済み Twitter アカウントの取得に失敗しました:{' '}
          {twitterAccountsError.message}
        </div>
      </div>
    );
  }

  // 認証済みアカウントがない場合
  if (twitterAccountsData.accounts.length === 0) {
    return (
      <div className={formContainer}>
        <div className={formHeader}>
          <h1>新しいターゲットアカウントを追加</h1>
        </div>
        <div className={errorContainer}>
          認証済み Twitter アカウントがありません。まず Twitter
          アカウントを認証してください。
        </div>
        <div className={buttonGroup}>
          <button type="button" onClick={handleCancel} className={cancelButton}>
            戻る
          </button>
        </div>
      </div>
    );
  }

  const [formData, setFormData] = useState({
    username: '',
    twitter_account_id:
      twitterAccountsData.accounts.length > 0
        ? twitterAccountsData.accounts[0].id
        : 0,
    fetch_interval_minutes: 60,
    max_tweets_per_fetch: 50,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ターゲットアカウント作成のミューテーション
  const createTargetAccountMutation = useMutation({
    mutationFn: (data: TargetAccountCreateRequest) => createTargetAccount(data),
    onSuccess: (response) => {
      // キャッシュを無効化して最新データを取得
      queryClient.invalidateQueries({ queryKey: ['target-accounts'] });

      // 作成に成功した場合、詳細ページまたは一覧画面に遷移
      if (response.success && response.account) {
        // 作成されたアカウントの詳細ページに遷移
        navigate({
          to: '/target-accounts/$accountId',
          params: { accountId: response.account.id.toString() },
        });
      } else {
        // 一覧画面に戻る
        navigate({ to: '/target-accounts' });
      }
    },
    onError: (error) => {
      console.error('Target account creation failed:', error);
      // エラーメッセージの表示はミューテーションのerrorプロパティで管理される
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // フォーム バリデーション
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Twitter ユーザー名は必須です';
    }

    // Twitter ユーザー名の形式チェック（@マークの有無を考慮）
    const usernamePattern = /^@?[a-zA-Z0-9_]{1,15}$/;
    const cleanUsername = formData.username.replace(/^@/, ''); // @マークを除去
    if (
      formData.username.trim() &&
      !usernamePattern.test(`@${cleanUsername}`)
    ) {
      newErrors.username =
        'Twitter ユーザー名は1-15文字の英数字とアンダースコアのみ使用可能です';
    }

    if (!formData.twitter_account_id || formData.twitter_account_id <= 0) {
      newErrors.twitter_account_id = 'Twitter アカウントを選択してください';
    }

    if (formData.fetch_interval_minutes < 1) {
      newErrors.fetch_interval_minutes = '取得間隔は1分以上で設定してください';
    }

    if (formData.fetch_interval_minutes > 1440) {
      newErrors.fetch_interval_minutes =
        '取得間隔は1440分以下で設定してください';
    }

    if (formData.max_tweets_per_fetch < 1) {
      newErrors.max_tweets_per_fetch =
        '最大取得ツイート数は1以上で設定してください';
    }

    if (formData.max_tweets_per_fetch > 200) {
      newErrors.max_tweets_per_fetch =
        '最大取得ツイート数は200以下で設定してください';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // API を呼び出してターゲットアカウントを作成
    const createData: TargetAccountCreateRequest = {
      username: cleanUsername, // @マークを除去したユーザー名を送信
      twitter_account_id: formData.twitter_account_id,
      fetch_interval_minutes: formData.fetch_interval_minutes,
      max_tweets_per_fetch: formData.max_tweets_per_fetch,
    };

    createTargetAccountMutation.mutate(createData);
  };

  return (
    <div className={formContainer}>
      <div className={formHeader}>
        <h1>新しいターゲットアカウントを追加</h1>
        <p>Twitter アカウントをツイート取得対象として追加します</p>
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
            placeholder="例: @elonmusk または elonmusk"
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
          <label htmlFor="twitter_account_id" className={label}>
            使用する認証済み Twitter アカウント
          </label>
          <select
            id="twitter_account_id"
            value={formData.twitter_account_id}
            onChange={(e) =>
              setFormData({
                ...formData,
                twitter_account_id: Number(e.target.value),
              })
            }
            className={select}
          >
            {twitterAccountsData.accounts.length === 0 && (
              <option value={0}>認証済みアカウントがありません</option>
            )}
            {twitterAccountsData.accounts.map((account) => (
              <option key={account.id} value={account.id}>
                @{account.username} ({account.display_name})
              </option>
            ))}
          </select>
          {errors.twitter_account_id && (
            <span className={errorMessage}>{errors.twitter_account_id}</span>
          )}
          <p
            style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              marginTop: '0.25rem',
            }}
          >
            ツイート取得に使用する認証済み Twitter アカウントを選択してください
          </p>
        </div>

        <div className={formGroup}>
          <label htmlFor="fetch_interval_minutes" className={label}>
            取得間隔（分）
          </label>
          <input
            id="fetch_interval_minutes"
            type="number"
            min="1"
            max="1440"
            value={formData.fetch_interval_minutes}
            onChange={(e) =>
              setFormData({
                ...formData,
                fetch_interval_minutes: Number(e.target.value),
              })
            }
            className={input}
            placeholder="60"
          />
          {errors.fetch_interval_minutes && (
            <span className={errorMessage}>
              {errors.fetch_interval_minutes}
            </span>
          )}
          <p
            style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              marginTop: '0.25rem',
            }}
          >
            ツイートを取得する間隔を分単位で設定します（1-1440分）
          </p>
        </div>

        <div className={formGroup}>
          <label htmlFor="max_tweets_per_fetch" className={label}>
            最大取得ツイート数
          </label>
          <input
            id="max_tweets_per_fetch"
            type="number"
            min="1"
            max="200"
            value={formData.max_tweets_per_fetch}
            onChange={(e) =>
              setFormData({
                ...formData,
                max_tweets_per_fetch: Number(e.target.value),
              })
            }
            className={input}
            placeholder="50"
          />
          {errors.max_tweets_per_fetch && (
            <span className={errorMessage}>{errors.max_tweets_per_fetch}</span>
          )}
          <p
            style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              marginTop: '0.25rem',
            }}
          >
            1回の取得で取得する最大ツイート数を設定します（1-200件）
          </p>
        </div>

        {/* ミューテーションエラーの表示 */}
        {createTargetAccountMutation.error && (
          <div className={mutationErrorContainer}>
            作成エラー: {createTargetAccountMutation.error.message}
          </div>
        )}

        <div className={buttonGroup}>
          <button
            type="submit"
            className={saveButton}
            disabled={createTargetAccountMutation.isPending}
          >
            {createTargetAccountMutation.isPending ? '作成中...' : '作成'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className={cancelButton}
            disabled={createTargetAccountMutation.isPending}
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
}
