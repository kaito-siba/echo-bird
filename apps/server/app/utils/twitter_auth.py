import json
import logging
import time
import uuid
from typing import Any

from twikit import Client
from twikit.errors import TwitterException

from app.models.twitter_account import TwitterAccount
from app.models.user import User
from app.utils.encryption import encrypt_password
from app.utils.session_manager import TFASession, session_manager

logger = logging.getLogger(__name__)


class AuthChallengeRequiredException(Exception):
    """
    認証チャレンジが必要な場合に発生する例外

    Twitter ログイン時に追加の認証が必要な場合（LoginAcid、LoginTwoFactorAuthChallenge など）、
    追加認証コードの入力が必要であることを示す
    """

    def __init__(
        self, session_id: str, prompt_message: str, challenge_type: str = 'unknown'
    ):
        self.session_id = session_id
        self.prompt_message = prompt_message
        self.challenge_type = (
            challenge_type  # 'LoginAcid' or 'LoginTwoFactorAuthChallenge'
        )
        super().__init__(prompt_message)


class TwitterAuthService:
    """
    Twitter 認証サービス

    twikit を使用して Twitter アカウントの認証と情報取得を行うサービス
    TFA (Two-Factor Authentication) に対応し、2段階認証フローをサポート
    """

    def __init__(self):
        self.client = Client('ja-JP')  # 日本語設定でクライアントを初期化
        self._challenge_input_override: str | None = (
            None  # 認証チャレンジコード入力の制御用
        )

    def _mock_input(self, prompt: str = '') -> str:
        """
        twikit の input() 呼び出しを制御するためのモック関数

        認証コードが設定されている場合はそれを返し、
        設定されていない場合は AuthChallengeRequiredException を発生させる

        Args:
            prompt: 入力プロンプト文字列

        Returns:
            str: 認証チャレンジコード

        Raises:
            AuthChallengeRequiredException: 認証チャレンジが必要な場合
        """
        if self._challenge_input_override is not None:
            return self._challenge_input_override

        # 認証コードが設定されていない場合は例外を発生
        # この時点でセッションを作成する必要がある
        raise AuthChallengeRequiredException(
            'AUTH_CHALLENGE_REQUIRED', prompt, 'unknown'
        )

    async def authenticate_init(
        self,
        user: User,
        username: str,
        email: str,
        password: str,
    ) -> tuple[
        bool, TwitterAccount | None, str | AuthChallengeRequiredException | None
    ]:
        """
        Twitter アカウント初回認証（認証チャレンジ検出付き）

        認証チャレンジが不要な場合は認証完了し、チャレンジが必要な場合は AuthChallengeRequiredException を発生

        Args:
            user: EchoBird のユーザー
            username: Twitter ユーザー名
            email: Twitter メールアドレス
            password: Twitter パスワード

        Returns:
            tuple: (成功フラグ, TwitterAccount | None, エラーメッセージ | AuthChallengeRequiredException | None)
        """
        # input() 関数をモンキーパッチ
        import builtins

        original_input = builtins.input
        builtins.input = self._mock_input

        try:
            # twikit を使用してログイン
            await self.client.login(
                auth_info_1=username,
                auth_info_2=email,
                password=password,
            )

            # 認証チャレンジが不要な場合はここまで到達する
            return await self._complete_authentication(user, username, email, password)

        except AuthChallengeRequiredException as challenge_ex:
            # 認証チャレンジが必要な場合、セッションを作成
            session = session_manager.create_session(
                user=user,
                username=username,
                email=email,
                password=password,
                flow_state=None,  # 必要に応じて後で Flow 状態を保存
            )

            logger.info(
                f'Authentication challenge required for Twitter account: @{username}, type: {challenge_ex.challenge_type}, session: {session.session_id}'
            )
            return (
                False,
                None,
                AuthChallengeRequiredException(
                    session.session_id,
                    challenge_ex.prompt_message,
                    challenge_ex.challenge_type,
                ),
            )

        except TwitterException as ex:
            error_msg = f'Twitter authentication failed: {ex!s}'
            logger.error(error_msg)
            return False, None, error_msg

        except Exception as ex:
            error_msg = f'Unexpected error during Twitter authentication: {ex!s}'
            logger.error(error_msg, exc_info=True)
            return False, None, error_msg

        finally:
            # input() 関数を元に戻す
            builtins.input = original_input

    async def authenticate_challenge(
        self,
        session_id: str,
        challenge_code: str,
    ) -> tuple[bool, TwitterAccount | None, str | None]:
        """
        認証チャレンジコードを使用して Twitter 認証を完了

        Args:
            session_id: 認証セッション ID
            challenge_code: 認証チャレンジコード（メールコード、TOTPコードなど）

        Returns:
            tuple: (成功フラグ, TwitterAccount, エラーメッセージ)
        """
        # セッション情報を取得
        session = session_manager.get_session(session_id)
        if session is None:
            error_msg = 'Invalid or expired authentication session'
            logger.error(error_msg)
            return False, None, error_msg

        # 認証チャレンジコードを設定
        self._challenge_input_override = challenge_code

        # input() 関数をモンキーパッチ
        import builtins

        original_input = builtins.input
        builtins.input = self._mock_input

        try:
            # 新しいクライアントで再認証
            await self.client.login(
                auth_info_1=session.username,
                auth_info_2=session.email,
                password=session.password,
            )

            # 認証完了
            result = await self._complete_authentication(
                session.user,
                session.username,
                session.email,
                session.password,
            )

            # セッションを削除
            session_manager.delete_session(session_id)

            return result

        except TwitterException as ex:
            error_msg = f'Challenge authentication failed: {ex!s}'
            logger.error(error_msg)
            return False, None, error_msg

        except Exception as ex:
            error_msg = f'Unexpected error during challenge authentication: {ex!s}'
            logger.error(error_msg, exc_info=True)
            return False, None, error_msg

        finally:
            # input() 関数を元に戻す
            builtins.input = original_input
            # 認証チャレンジコード設定をクリア
            self._challenge_input_override = None

    async def _complete_authentication(
        self,
        user: User,
        username: str,
        email: str,
        password: str,
    ) -> tuple[bool, TwitterAccount | None, str | None]:
        """
        Twitter 認証完了処理（共通部分）

        Args:
            user: EchoBird のユーザー
            username: Twitter ユーザー名
            email: Twitter メールアドレス
            password: Twitter パスワード

        Returns:
            tuple: (成功フラグ, TwitterAccount, エラーメッセージ)
        """
        try:
            # ログイン成功後、ユーザー情報を取得
            twitter_user = await self.client.user()

            # クッキー情報を取得
            cookies = self.client.get_cookies()

            # パスワードを暗号化
            encrypted_password = encrypt_password(password)

            # 既存のアカウントをチェック
            existing_account = await TwitterAccount.filter(
                twitter_id=twitter_user.id
            ).first()

            if existing_account:
                # 既存アカウントを更新
                existing_account.user = user
                existing_account.username = twitter_user.screen_name
                existing_account.display_name = twitter_user.name
                existing_account.email = email
                existing_account.password_encrypted = encrypted_password
                existing_account.cookies_data = json.dumps(cookies)
                existing_account.profile_image_url = twitter_user.profile_image_url
                existing_account.bio = twitter_user.description
                existing_account.followers_count = twitter_user.followers_count
                existing_account.following_count = twitter_user.following_count
                existing_account.last_login_at = int(time.time())
                existing_account.is_active = True

                await existing_account.save()
                twitter_account = existing_account

            else:
                # 新規アカウントを作成
                twitter_account = await TwitterAccount.create(
                    user=user,
                    twitter_id=twitter_user.id,
                    username=twitter_user.screen_name,
                    display_name=twitter_user.name,
                    email=email,
                    password_encrypted=encrypted_password,
                    cookies_data=json.dumps(cookies),
                    profile_image_url=twitter_user.profile_image_url,
                    bio=twitter_user.description,
                    followers_count=twitter_user.followers_count,
                    following_count=twitter_user.following_count,
                    last_login_at=int(time.time()),
                    is_active=True,
                )

            logger.info(
                f'Twitter account authenticated successfully: @{twitter_user.screen_name}'
            )
            return True, twitter_account, None

        except Exception as ex:
            error_msg = f'Failed to save Twitter account: {ex!s}'
            logger.error(error_msg, exc_info=True)
            return False, None, error_msg

    async def authenticate_and_save(
        self,
        user: User,
        username: str,
        email: str,
        password: str,
    ) -> tuple[bool, TwitterAccount | None, str | None]:
        """
        【廃止予定】Twitter アカウント認証とアカウント情報保存

        このメソッドは TFA 非対応の後方互換性のために残されています。
        新しい実装では authenticate_init() を使用してください。

        Args:
            user: EchoBird のユーザー
            username: Twitter ユーザー名
            email: Twitter メールアドレス
            password: Twitter パスワード

        Returns:
            tuple: (成功フラグ, TwitterAccount, エラーメッセージ)
        """
        # 新しい TFA 対応メソッドにリダイレクト
        result = await self.authenticate_init(user, username, email, password)

        # AuthChallengeRequiredException の場合は通常のエラーとして扱う
        if isinstance(result[2], AuthChallengeRequiredException):
            return (
                False,
                None,
                'Additional authentication challenge is required for this account',
            )

        return result

    async def load_account_session(self, twitter_account: TwitterAccount) -> bool:
        """
        保存された Twitter アカウントのセッションを復元

        Args:
            twitter_account: 復元対象の Twitter アカウント

        Returns:
            bool: 復元成功フラグ
        """
        try:
            if not twitter_account.cookies_data:
                return False

            cookies = json.loads(twitter_account.cookies_data)
            self.client.set_cookies(cookies)

            # セッションが有効かテスト
            await self.client.user()

            logger.info(
                f'Session restored for Twitter account: @{twitter_account.username}'
            )
            return True

        except Exception as e:
            logger.error(
                f'Failed to restore session for @{twitter_account.username}: {e!s}'
            )
            return False

    async def refresh_account_info(self, twitter_account: TwitterAccount) -> bool:
        """
        Twitter アカウント情報を最新の状態に更新

        Args:
            twitter_account: 更新対象の Twitter アカウント

        Returns:
            bool: 更新成功フラグ
        """
        try:
            # セッションを復元
            if not await self.load_account_session(twitter_account):
                return False

            # 最新のユーザー情報を取得
            twitter_user = await self.client.user()

            # アカウント情報を更新
            twitter_account.display_name = twitter_user.name
            twitter_account.profile_image_url = twitter_user.profile_image_url
            twitter_account.bio = twitter_user.description
            twitter_account.followers_count = twitter_user.followers_count
            twitter_account.following_count = twitter_user.following_count

            await twitter_account.save()

            logger.info(f'Account info refreshed for: @{twitter_account.username}')
            return True

        except Exception as e:
            logger.error(
                f'Failed to refresh account info for @{twitter_account.username}: {e!s}'
            )
            return False
