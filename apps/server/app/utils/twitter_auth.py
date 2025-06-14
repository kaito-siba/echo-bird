import json
import logging
import time

from twikit import Client
from twikit.errors import TwitterException

from app.models.twitter_account import TwitterAccount
from app.models.user import User
from app.utils.encryption import encrypt_password

logger = logging.getLogger(__name__)


class TwitterAuthService:
    """
    Twitter 認証サービス

    twikit を使用して Twitter アカウントの認証と情報取得を行うサービス
    """

    def __init__(self):
        self.client = Client('ja-JP')  # 日本語設定でクライアントを初期化

    async def authenticate_and_save(
        self,
        user: User,
        username: str,
        email: str,
        password: str,
    ) -> tuple[bool, TwitterAccount | None, str | None]:
        """
        Twitter アカウント認証とアカウント情報保存

        Args:
            user: EchoBird のユーザー
            username: Twitter ユーザー名
            email: Twitter メールアドレス
            password: Twitter パスワード

        Returns:
            tuple: (成功フラグ, TwitterAccount, エラーメッセージ)
        """
        try:
            # twikit を使用してログイン
            await self.client.login(
                auth_info_1=username,
                auth_info_2=email,
                password=password,
            )

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

        except TwitterException as e:
            error_msg = f'Twitter authentication failed: {e!s}'
            logger.error(error_msg)
            return False, None, error_msg

        except Exception as e:
            error_msg = f'Unexpected error during Twitter authentication: {e!s}'
            logger.error(error_msg, exc_info=True)
            return False, None, error_msg

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
