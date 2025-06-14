import json
import logging
import time
from typing import Any

from twikit import Client
from twikit.errors import TwitterException

from app.models.target_account import TargetAccount
from app.models.tweet import Tweet
from app.models.twitter_account import TwitterAccount
from app.models.user import User

logger = logging.getLogger(__name__)


class TwitterService:
    """
    Twitter サービス

    twikit を使用してTwitter APIとの連携を行うサービス
    TargetAccount の管理とツイート取得を担当
    """

    def __init__(self):
        self.client = Client('ja-JP')  # 日本語設定でクライアントを初期化

    async def load_twitter_account_session(
        self, twitter_account: TwitterAccount
    ) -> bool:
        """
        TwitterAccount のセッションを復元

        Args:
            twitter_account: 復元対象の Twitter アカウント

        Returns:
            bool: 復元成功フラグ
        """
        try:
            if not twitter_account.cookies_data:
                logger.warning(f'No cookies data found for @{twitter_account.username}')
                return False

            cookies = json.loads(twitter_account.cookies_data)
            self.client.set_cookies(cookies)

            # セッションが有効かテスト
            await self.client.user()

            logger.info(
                f'Session restored for Twitter account: @{twitter_account.username}'
            )
            return True

        except Exception as ex:
            logger.error(
                f'Failed to restore session for @{twitter_account.username}',
                exc_info=ex,
            )
            return False

    async def get_user_info_and_save(
        self,
        twitter_account: TwitterAccount,
        target_username: str,
        current_user: User,
        fetch_interval_minutes: int = 60,
        max_tweets_per_fetch: int = 20,
    ) -> tuple[bool, TargetAccount | None, str | None]:
        """
        ターゲットユーザーの情報を取得してTargetAccountを作成・更新

        Args:
            twitter_account: 認証済みのTwitterアカウント
            target_username: ターゲットユーザー名
            current_user: 現在のEchoBirdユーザー
            fetch_interval_minutes: 取得間隔（分）
            max_tweets_per_fetch: 最大取得ツイート数

        Returns:
            tuple: (成功フラグ, TargetAccount, エラーメッセージ)
        """
        try:
            # TwitterAccount のセッションを復元
            if not await self.load_twitter_account_session(twitter_account):
                return False, None, 'Twitter アカウントのセッション復元に失敗しました'

            # ターゲットユーザーの情報を取得
            target_user = await self.client.get_user_by_screen_name(target_username)

            if not target_user:
                return False, None, f'ユーザー @{target_username} が見つかりません'

            # 既存のTargetAccountをチェック
            existing_target = await TargetAccount.filter(
                twitter_user_id=target_user.id
            ).first()

            current_time = int(time.time())

            if existing_target:
                # 既存のTargetAccountを更新
                existing_target.user = current_user
                existing_target.username = target_user.screen_name
                existing_target.display_name = target_user.name
                existing_target.description = target_user.description
                existing_target.location = target_user.location
                existing_target.url = target_user.url
                existing_target.profile_image_url = getattr(
                    target_user, 'profile_image_url_https', None
                )
                existing_target.profile_banner_url = getattr(
                    target_user, 'profile_banner_url', None
                )
                existing_target.is_protected = getattr(target_user, 'protected', False)
                existing_target.is_verified = getattr(target_user, 'verified', False)
                existing_target.is_blue_verified = getattr(
                    target_user, 'is_blue_verified', False
                )
                existing_target.followers_count = getattr(
                    target_user, 'followers_count', 0
                )
                existing_target.following_count = getattr(
                    target_user, 'friends_count', 0
                )
                existing_target.tweets_count = target_user.statuses_count
                existing_target.listed_count = target_user.listed_count
                existing_target.favorites_count = target_user.favourites_count
                existing_target.fetch_interval_minutes = fetch_interval_minutes
                existing_target.max_tweets_per_fetch = max_tweets_per_fetch
                existing_target.account_created_at = self._parse_twitter_date(
                    target_user.created_at
                )
                existing_target.is_active = True

                await existing_target.save()
                target_account = existing_target

            else:
                # 新規TargetAccountを作成
                target_account = await TargetAccount.create(
                    user=current_user,
                    twitter_user_id=target_user.id,
                    username=target_user.screen_name,
                    display_name=target_user.name,
                    description=target_user.description,
                    location=target_user.location,
                    url=target_user.url,
                    profile_image_url=getattr(
                        target_user, 'profile_image_url_https', None
                    ),
                    profile_banner_url=getattr(target_user, 'profile_banner_url', None),
                    is_protected=getattr(target_user, 'protected', False),
                    is_verified=getattr(target_user, 'verified', False),
                    is_blue_verified=getattr(target_user, 'is_blue_verified', False),
                    followers_count=getattr(target_user, 'followers_count', 0),
                    following_count=getattr(target_user, 'friends_count', 0),
                    tweets_count=target_user.statuses_count,
                    listed_count=target_user.listed_count,
                    favorites_count=target_user.favourites_count,
                    fetch_interval_minutes=fetch_interval_minutes,
                    max_tweets_per_fetch=max_tweets_per_fetch,
                    account_created_at=self._parse_twitter_date(target_user.created_at),
                    created_at=current_time,
                    updated_at=current_time,
                )

            logger.info(f'Target account processed successfully: @{target_username}')
            return True, target_account, None

        except TwitterException as ex:
            error_msg = f'Twitter API error: {ex!s}'
            logger.error(error_msg)
            return False, None, error_msg

        except Exception as ex:
            error_msg = f'Unexpected error: {ex!s}'
            logger.error(error_msg, exc_info=ex)
            return False, None, error_msg

    async def fetch_user_tweets(
        self,
        twitter_account: TwitterAccount,
        target_account: TargetAccount,
    ) -> int:
        """
        ターゲットアカウントのツイートを取得してデータベースに保存

        Args:
            twitter_account: 認証済みのTwitterアカウント
            target_account: ツイート取得対象のアカウント

        Returns:
            int: 取得したツイート数
        """
        try:
            # TwitterAccount のセッションを復元
            if not await self.load_twitter_account_session(twitter_account):
                await self._record_fetch_error(
                    target_account, 'Twitter アカウントのセッション復元に失敗しました'
                )
                return 0

            # ターゲットユーザーのツイートを取得
            tweets = await self.client.get_user_tweets(
                target_account.twitter_user_id,
                tweet_type='Tweets',
                count=target_account.max_tweets_per_fetch,
            )

            if not tweets:
                logger.info(f'No tweets found for @{target_account.username}')
                await self._update_fetch_success(target_account, None)
                return 0

            fetched_count = 0
            latest_tweet_id = None

            for tweet_data in tweets:
                # 既存のツイートをチェック
                existing_tweet = await Tweet.filter(tweet_id=tweet_data.id).first()

                if existing_tweet:
                    continue  # 既に保存済み

                # ツイートを保存
                await self._save_tweet(tweet_data, target_account)
                fetched_count += 1

                if latest_tweet_id is None:
                    latest_tweet_id = tweet_data.id

            # 取得成功を記録
            await self._update_fetch_success(target_account, latest_tweet_id)

            logger.info(
                f'Fetched {fetched_count} tweets for @{target_account.username}'
            )
            return fetched_count

        except TwitterException as ex:
            error_msg = f'Twitter API error: {ex!s}'
            logger.error(error_msg)
            await self._record_fetch_error(target_account, error_msg)
            return 0

        except Exception as ex:
            error_msg = f'Unexpected error during tweet fetch: {ex!s}'
            logger.error(error_msg, exc_info=ex)
            await self._record_fetch_error(target_account, error_msg)
            return 0

    async def _save_tweet(self, tweet_data: Any, target_account: TargetAccount) -> None:
        """
        ツイートデータをデータベースに保存

        Args:
            tweet_data: twikit から取得したツイートデータ
            target_account: 取得元のターゲットアカウント
        """
        try:
            current_time = int(time.time())

            await Tweet.create(
                tweet_id=tweet_data.id,
                target_account=target_account,
                content=tweet_data.text,
                full_text=tweet_data.full_text,
                lang=tweet_data.lang,
                likes_count=getattr(tweet_data, 'favorite_count', 0),
                retweets_count=getattr(tweet_data, 'retweet_count', 0),
                replies_count=getattr(tweet_data, 'reply_count', 0),
                quotes_count=getattr(tweet_data, 'quote_count', 0),
                views_count=getattr(tweet_data, 'view_count', 0),
                bookmark_count=getattr(tweet_data, 'bookmark_count', 0),
                is_retweet=hasattr(tweet_data, 'retweeted_status'),
                is_quote=hasattr(tweet_data, 'quoted_status'),
                retweeted_tweet_id=getattr(tweet_data, 'retweeted_status_id', None),
                quoted_tweet_id=getattr(tweet_data, 'quoted_status_id', None),
                is_reply=hasattr(tweet_data, 'in_reply_to_status_id'),
                in_reply_to_tweet_id=getattr(tweet_data, 'in_reply_to_status_id', None),
                in_reply_to_user_id=getattr(tweet_data, 'in_reply_to_user_id', None),
                conversation_id=getattr(tweet_data, 'conversation_id', None),
                hashtags=getattr(tweet_data, 'hashtags', None),
                urls=getattr(tweet_data, 'urls', None),
                user_mentions=getattr(tweet_data, 'user_mentions', None),
                is_possibly_sensitive=False,  # TODO delete it
                has_media=getattr(tweet_data, 'has_media', False),
                posted_at=self._parse_twitter_date(tweet_data.created_at),
                created_at=current_time,
                updated_at=current_time,
            )

        except Exception as ex:
            logger.error(f'Failed to save tweet {tweet_data.id}', exc_info=ex)

    async def _update_fetch_success(
        self, target_account: TargetAccount, latest_tweet_id: str | None
    ) -> None:
        """
        取得成功を記録

        Args:
            target_account: 対象アカウント
            latest_tweet_id: 最新のツイートID
        """
        current_time = int(time.time())
        target_account.last_fetched_at = current_time
        target_account.consecutive_errors = 0
        target_account.last_error = None
        target_account.last_error_at = None

        if latest_tweet_id:
            target_account.last_tweet_id = latest_tweet_id

        await target_account.save()

    async def _record_fetch_error(
        self, target_account: TargetAccount, error_message: str
    ) -> None:
        """
        取得エラーを記録

        Args:
            target_account: 対象アカウント
            error_message: エラーメッセージ
        """
        current_time = int(time.time())
        target_account.consecutive_errors += 1
        target_account.last_error = error_message
        target_account.last_error_at = current_time

        await target_account.save()

    def _parse_twitter_date(self, twitter_date: str) -> int:
        """
        TwitterのcreatedAt文字列をUnixタイムスタンプに変換

        Args:
            twitter_date: Twitter API の created_at 文字列

        Returns:
            int: Unix タイムスタンプ
        """
        try:
            # Twitter の日付形式: "Wed Oct 10 20:19:24 +0000 2018"
            from datetime import datetime

            dt = datetime.strptime(twitter_date, '%a %b %d %H:%M:%S %z %Y')
            return int(dt.timestamp())
        except Exception:
            # パースに失敗した場合は現在時刻を返す
            return int(time.time())
