import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { targetAccountListQueryOptions } from '../integrations/tanstack-query/queries/target-account';
import {
  timelineDetailQueryOptions,
  useUpdateTimelineMutation,
} from '../integrations/tanstack-query/queries/timeline';
import {
  buttonGroup,
  cancelButton,
  checkbox,
  checkboxLabel,
  errorMessage,
  formContainer,
  formGroup,
  formHeader,
  input,
  label,
  submitButton,
  textarea,
} from '../styles/admin-form.css';

export const Route = createFileRoute('/timelines/$timelineId/edit')({
  loader: ({ context, params }: { context: any; params: any }) => {
    const timelineId = Number.parseInt(params.timelineId);
    return Promise.all([
      context.queryClient.ensureQueryData(
        timelineDetailQueryOptions(timelineId),
      ),
      context.queryClient.ensureQueryData(targetAccountListQueryOptions),
    ]);
  },
  component: EditTimeline,
});

function EditTimeline() {
  const navigate = useNavigate();
  const { timelineId } = Route.useParams();

  // データ取得
  const { data: timeline } = useSuspenseQuery(
    timelineDetailQueryOptions(Number.parseInt(timelineId)),
  );
  const { data: targetAccountsData } = useSuspenseQuery(
    targetAccountListQueryOptions,
  );
  const updateTimelineMutation = useUpdateTimelineMutation();

  // フォーム状態
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    target_account_ids: [] as number[],
    is_active: true,
    is_default: false,
  });

  const [error, setError] = useState<string | null>(null);

  // タイムラインデータでフォームを初期化
  useEffect(() => {
    if (timeline) {
      setFormData({
        name: timeline.name,
        description: timeline.description || '',
        target_account_ids: timeline.target_accounts.map(
          (account) => account.id,
        ),
        is_active: timeline.is_active,
        is_default: timeline.is_default,
      });
    }
  }, [timeline]);

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // バリデーション
    if (!formData.name.trim()) {
      setError('タイムライン名を入力してください。');
      return;
    }

    if (formData.target_account_ids.length === 0) {
      setError('少なくとも1つのターゲットアカウントを選択してください。');
      return;
    }

    try {
      await updateTimelineMutation.mutateAsync({
        timelineId: Number.parseInt(timelineId),
        data: {
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          target_account_ids: formData.target_account_ids,
          is_active: formData.is_active,
          is_default: formData.is_default,
        },
      });

      alert('タイムラインを更新しました');
      navigate({ to: '/timelines' });
    } catch (error) {
      console.error('Failed to update timeline:', error);
      setError('タイムラインの更新に失敗しました。');
    }
  };

  // ターゲットアカウント選択の切り替え
  const handleTargetAccountToggle = (accountId: number) => {
    setFormData((prev) => ({
      ...prev,
      target_account_ids: prev.target_account_ids.includes(accountId)
        ? prev.target_account_ids.filter((id) => id !== accountId)
        : [...prev.target_account_ids, accountId],
    }));
  };

  return (
    <div className={formContainer}>
      <div className={formHeader}>
        <h1>タイムライン「{timeline.name}」を編集</h1>
        <p>タイムラインの設定やターゲットアカウントを変更できます。</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* タイムライン名 */}
        <div className={formGroup}>
          <label className={label}>
            タイムライン名 <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="例: 技術系アカウント"
            className={input}
            maxLength={255}
            required
          />
        </div>

        {/* 説明 */}
        <div className={formGroup}>
          <label className={label}>説明（任意）</label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="このタイムラインについての説明を入力してください..."
            className={textarea}
            rows={3}
          />
        </div>

        {/* ターゲットアカウント選択 */}
        <div className={formGroup}>
          <label className={label}>
            ターゲットアカウント <span style={{ color: 'red' }}>*</span>
          </label>
          <p
            style={{
              fontSize: '0.875rem',
              color: '#666',
              marginBottom: '1rem',
            }}
          >
            タイムラインに含めるターゲットアカウントを選択してください（複数選択可能）
          </p>

          <div
            style={{
              maxHeight: '300px',
              overflowY: 'auto',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              padding: '1rem',
            }}
          >
            {targetAccountsData.accounts.length > 0 ? (
              targetAccountsData.accounts.map((account) => (
                <label key={account.id} className={checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.target_account_ids.includes(account.id)}
                    onChange={() => handleTargetAccountToggle(account.id)}
                    className={checkbox}
                  />
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    {account.profile_image_url && (
                      <img
                        src={account.profile_image_url}
                        alt={account.username}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                        }}
                      />
                    )}
                    <span>
                      @{account.username}
                      {account.display_name && ` (${account.display_name})`}
                    </span>
                    {!account.is_active && (
                      <span
                        style={{
                          fontSize: '12px',
                          color: '#f44336',
                          fontWeight: 'bold',
                        }}
                      >
                        非アクティブ
                      </span>
                    )}
                  </div>
                </label>
              ))
            ) : (
              <p style={{ color: '#666', textAlign: 'center' }}>
                ターゲットアカウントが登録されていません。
                <br />
                <a href="/target-accounts/create" style={{ color: '#2196F3' }}>
                  ターゲットアカウントを追加
                </a>
                してください。
              </p>
            )}
          </div>

          {formData.target_account_ids.length > 0 && (
            <p
              style={{
                fontSize: '0.875rem',
                color: '#666',
                marginTop: '0.5rem',
              }}
            >
              {formData.target_account_ids.length}個のアカウントを選択中
            </p>
          )}
        </div>

        {/* オプション設定 */}
        <div className={formGroup}>
          <label className={label}>オプション</label>

          <label className={checkboxLabel}>
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  is_active: e.target.checked,
                }))
              }
              className={checkbox}
            />
            アクティブ状態
            <span
              style={{ fontSize: '0.875rem', color: '#666', marginLeft: '8px' }}
            >
              （アクティブでないタイムラインは表示されません）
            </span>
          </label>

          <label className={checkboxLabel}>
            <input
              type="checkbox"
              checked={formData.is_default}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  is_default: e.target.checked,
                }))
              }
              className={checkbox}
            />
            デフォルトタイムライン
            <span
              style={{ fontSize: '0.875rem', color: '#666', marginLeft: '8px' }}
            >
              （メインのタイムラインとして使用）
            </span>
          </label>
        </div>

        {/* エラーメッセージ */}
        {error && <div className={errorMessage}>{error}</div>}

        {/* ボタン */}
        <div className={buttonGroup}>
          <button
            type="submit"
            disabled={updateTimelineMutation.isPending}
            className={submitButton}
          >
            {updateTimelineMutation.isPending
              ? '更新中...'
              : 'タイムラインを更新'}
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: '/timelines' })}
            className={cancelButton}
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
}
