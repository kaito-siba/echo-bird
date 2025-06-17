import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import {
  type TwitterAuthInitResponse,
  type TwitterAuthRequest,
  type TwitterChallengeRequest,
  authenticateTwitterAccountChallenge,
  authenticateTwitterAccountInit,
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

  // 認証チャレンジ関連の状態管理
  const [authStep, setAuthStep] = useState<'initial' | 'challenge'>('initial');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [challengeCode, setChallengeCode] = useState('');
  const [challengeError, setChallengeError] = useState<string | null>(null);
  const [promptMessage, setPromptMessage] = useState<string | null>(null);
  const [challengeType, setChallengeType] = useState<string | null>(null);

  // Twitter アカウント初回認証のミューテーション
  const authenticateInitMutation = useMutation({
    mutationFn: (data: TwitterAuthRequest) =>
      authenticateTwitterAccountInit(data),
    onSuccess: (response: TwitterAuthInitResponse) => {
      if (response.success && response.account) {
        // チャレンジ不要：認証完了
        onAuthenticationSuccess();
      } else if (response.needs_challenge && response.session_id) {
        // チャレンジ必要：チャレンジ入力画面に遷移
        setSessionId(response.session_id);
        setPromptMessage(
          response.prompt_message || '認証コードを入力してください',
        );
        setChallengeType(response.challenge_type || 'unknown');
        setAuthStep('challenge');
        setChallengeError(null);
      } else {
        // 認証失敗
        console.error('Initial authentication failed:', response.message);
      }
    },
    onError: (error) => {
      console.error('Initial Twitter authentication failed:', error);
    },
  });

  // 認証チャレンジのミューテーション
  const authenticateChallengeMutation = useMutation({
    mutationFn: (data: TwitterChallengeRequest) =>
      authenticateTwitterAccountChallenge(data),
    onSuccess: (response) => {
      if (response.success && response.account) {
        // チャレンジ認証成功
        onAuthenticationSuccess();
      } else {
        // チャレンジ認証失敗
        setChallengeError(
          response.message || 'Challenge authentication failed',
        );
      }
    },
    onError: (error) => {
      console.error('Challenge authentication failed:', error);
      setChallengeError(error.message || 'Challenge authentication failed');
    },
  });

  // 認証成功時の共通処理
  const onAuthenticationSuccess = () => {
    // キャッシュを無効化して最新データを取得
    queryClient.invalidateQueries({ queryKey: ['twitter-accounts'] });
    // アカウント管理画面の Twitter タブに遷移
    navigate({ to: '/account-management', search: { tab: 'twitter' } });
  };


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

    // API を呼び出して Twitter アカウントを認証（TFA対応）
    const authData: TwitterAuthRequest = {
      username: cleanUsername, // @マークを除去したユーザー名を送信
      email: formData.email,
      password: formData.password,
    };

    authenticateInitMutation.mutate(authData);
  };

  const handleCancel = () => {
    navigate({ to: '/account-management', search: { tab: 'twitter' } });
  };

  const handleChallengeSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // チャレンジコードのバリデーション
    if (!challengeCode.trim()) {
      setChallengeError('認証コードを入力してください');
      return;
    }

    if (!sessionId) {
      setChallengeError('セッションが無効です。最初からやり直してください');
      return;
    }

    setChallengeError(null);

    const challengeData: TwitterChallengeRequest = {
      session_id: sessionId,
      challenge_code: challengeCode,
    };

    authenticateChallengeMutation.mutate(challengeData);
  };

  const handleBackToInitial = () => {
    setAuthStep('initial');
    setSessionId(null);
    setChallengeCode('');
    setChallengeError(null);
    setPromptMessage(null);
    setChallengeType(null);
  };

  return (
    <div className={formContainer}>
      {authStep === 'initial' ? (
        // 初回認証画面
        <>
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
              {errors.email && (
                <span className={errorMessage}>{errors.email}</span>
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
                  二段階認証が有効なアカウントでは、認証コードの入力が必要です
                </li>
                <li>
                  パスワードは暗号化されますが、セキュリティ上のリスクを理解した上でご使用ください
                </li>
                <li>認証に失敗する場合は、Twitter の設定を確認してください</li>
              </ul>
            </div>

            {/* ミューテーションエラーの表示 */}
            {authenticateInitMutation.error && (
              <div className={mutationErrorContainer}>
                認証エラー: {authenticateInitMutation.error.message}
              </div>
            )}

            <div className={buttonGroup}>
              <button
                type="submit"
                className={saveButton}
                disabled={authenticateInitMutation.isPending}
              >
                {authenticateInitMutation.isPending ? '認証中...' : '認証'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className={cancelButton}
                disabled={authenticateInitMutation.isPending}
              >
                キャンセル
              </button>
            </div>
          </form>
        </>
      ) : (
        // 認証チャレンジコード入力画面
        <>
          <div className={formHeader}>
            <h1>認証コード入力</h1>
            <p>
              {promptMessage ||
                '追加認証が必要です。認証コードを入力してください。'}
            </p>
          </div>

          <form onSubmit={handleChallengeSubmit}>
            <div className={formGroup}>
              <label htmlFor="challenge-code" className={label}>
                認証コード
              </label>
              <input
                id="challenge-code"
                type="text"
                value={challengeCode}
                onChange={(e) => {
                  setChallengeCode(e.target.value);
                  setChallengeError(null);
                }}
                className={input}
                placeholder="認証コードを入力してください"
                style={{
                  fontSize: '1.2rem',
                  textAlign: 'center',
                }}
              />
              {challengeError && (
                <span className={errorMessage}>{challengeError}</span>
              )}
              <p
                style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  marginTop: '0.25rem',
                }}
              >
                {challengeType === 'LoginAcid'
                  ? 'メールに送信された認証コードを入力してください'
                  : challengeType === 'LoginTwoFactorAuthChallenge'
                    ? '認証アプリの6桁のコードを入力してください'
                    : '指定された認証コードを入力してください'}
              </p>
            </div>

            <div
              style={{
                padding: '1rem',
                backgroundColor: '#eff6ff',
                borderRadius: '4px',
                marginBottom: '1rem',
              }}
            >
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#1d4ed8' }}>
                🔐 認証について
              </h4>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: '1.5rem',
                  fontSize: '0.875rem',
                  color: '#1e40af',
                }}
              >
                {challengeType === 'LoginAcid' ? (
                  <>
                    <li>
                      Twitter登録メールアドレスに認証コードが送信されました
                    </li>
                    <li>
                      メールをご確認の上、受信したコードを入力してください
                    </li>
                    <li>
                      メールが届かない場合は、迷惑メールフォルダもご確認ください
                    </li>
                  </>
                ) : challengeType === 'LoginTwoFactorAuthChallenge' ? (
                  <>
                    <li>
                      Twitter
                      アプリの設定から「認証アプリ」に表示されるコードを入力
                    </li>
                    <li>認証コードは30秒～60秒で自動更新されます</li>
                    <li>
                      コードが正しくない場合は、新しいコードをお試しください
                    </li>
                  </>
                ) : (
                  <>
                    <li>指定された方法で認証コードを確認してください</li>
                    <li>コードが正しくない場合は、再度お試しください</li>
                  </>
                )}
              </ul>
            </div>

            {/* チャレンジ認証エラーの表示 */}
            {authenticateChallengeMutation.error && (
              <div className={mutationErrorContainer}>
                認証エラー: {authenticateChallengeMutation.error.message}
              </div>
            )}

            <div className={buttonGroup}>
              <button
                type="submit"
                className={saveButton}
                disabled={
                  authenticateChallengeMutation.isPending ||
                  !challengeCode.trim()
                }
              >
                {authenticateChallengeMutation.isPending
                  ? '認証中...'
                  : '認証完了'}
              </button>
              <button
                type="button"
                onClick={handleBackToInitial}
                className={cancelButton}
                disabled={authenticateChallengeMutation.isPending}
              >
                最初に戻る
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
