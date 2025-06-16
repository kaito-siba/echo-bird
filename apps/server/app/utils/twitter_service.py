import json
import logging
import time
from typing import Any

from twikit import Client
from twikit.errors import TwitterException

from app.models.media import Media
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
                existing_target.profile_image_url = target_user.profile_image_url
                existing_target.profile_banner_url = target_user.profile_banner_url
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
                    profile_image_url=getattr(target_user, 'profile_image_url', None),
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
        メディア情報も同時に保存し、ダウンロード処理をキューに追加

        Args:
            tweet_data: twikit から取得したツイートデータ
            target_account: 取得元のターゲットアカウント
        """
        try:
            current_time = int(time.time())

            # リツイート・引用ツイートの場合の本文取得
            is_retweet = (
                getattr(tweet_data, 'retweeted_status', None) is not None
                or getattr(tweet_data, 'retweeted_tweet', None) is not None
            )
            # twikitライブラリの正しいプロパティを使用
            is_quote = getattr(tweet_data, 'is_quote_status', False)

            # メディア取得用のデータソースを決定
            media_source_data = tweet_data  # デフォルトは元のツイートデータ

            if is_retweet:
                # リツイートの場合、元ツイートの本文を取得
                retweeted_tweet = getattr(
                    tweet_data, 'retweeted_status', None
                ) or getattr(tweet_data, 'retweeted_tweet', None)
                if retweeted_tweet:
                    content = retweeted_tweet.text
                    full_text = (
                        getattr(retweeted_tweet, 'full_text', None)
                        or retweeted_tweet.text
                    )
                    # 元ツイート作者の情報を取得
                    original_author = getattr(retweeted_tweet, 'user', None)
                    if original_author:
                        original_author_username = getattr(
                            original_author, 'screen_name', None
                        )
                        original_author_display_name = getattr(
                            original_author, 'name', None
                        )
                        original_author_profile_image_url = getattr(
                            original_author, 'profile_image_url', None
                        )
                    else:
                        original_author_username = None
                        original_author_display_name = None
                        original_author_profile_image_url = None

                    # リツイート元が引用ツイートかどうかをチェック
                    retweeted_is_quote = getattr(
                        retweeted_tweet, 'is_quote_status', False
                    )
                    if retweeted_is_quote:
                        # 引用ツイートをリツイートした場合、引用元ツイートも保存
                        quoted_tweet = getattr(retweeted_tweet, 'quote', None)
                        if quoted_tweet:
                            await self._save_quoted_tweet(quoted_tweet, target_account)

                    # リツイートの場合、メディアは元ツイートから取得
                    media_source_data = retweeted_tweet
                else:
                    content = tweet_data.text
                    full_text = (
                        getattr(tweet_data, 'full_text', None) or tweet_data.text
                    )
                    original_author_username = None
                    original_author_display_name = None
                    original_author_profile_image_url = None
            elif is_quote:
                # 引用ツイートの場合、引用コメント部分のみを保存（引用元は別途保存）
                content = tweet_data.text
                full_text = getattr(tweet_data, 'full_text', None) or tweet_data.text

                # 引用元ツイートの情報を取得して保存
                quoted_tweet = getattr(tweet_data, 'quote', None)
                if quoted_tweet:
                    await self._save_quoted_tweet(quoted_tweet, target_account)
                    # 引用元作者の情報を取得
                    quoted_author = getattr(quoted_tweet, 'user', None)
                    if quoted_author:
                        original_author_username = getattr(
                            quoted_author, 'screen_name', None
                        )
                        original_author_display_name = getattr(
                            quoted_author, 'name', None
                        )
                        original_author_profile_image_url = getattr(
                            quoted_author, 'profile_image_url', None
                        )
                    else:
                        original_author_username = None
                        original_author_display_name = None
                        original_author_profile_image_url = None
                else:
                    original_author_username = None
                    original_author_display_name = None
                    original_author_profile_image_url = None
            else:
                # 通常のツイート
                content = tweet_data.text
                full_text = getattr(tweet_data, 'full_text', None) or tweet_data.text
                original_author_username = None
                original_author_display_name = None
                original_author_profile_image_url = None

            # メディアの存在チェック（適切なデータソースから）
            has_media = bool(getattr(media_source_data, 'media', None))

            # 引用ツイートIDの取得
            quoted_tweet_id = None
            if is_quote and not is_retweet:
                # 直接的な引用ツイートの場合
                quoted_tweet = getattr(tweet_data, 'quote', None)
                if quoted_tweet:
                    quoted_tweet_id = quoted_tweet.id
            elif is_retweet and 'retweeted_tweet' in locals():
                # リツイートの場合（引用リツイートをリツイートした場合も含む）
                retweeted_is_quote = getattr(retweeted_tweet, 'is_quote_status', False)
                if retweeted_is_quote:
                    quoted_tweet = getattr(retweeted_tweet, 'quote', None)
                    if quoted_tweet:
                        quoted_tweet_id = quoted_tweet.id

            # デバッグログ
            retweeted_is_quote = False
            if is_retweet and 'retweeted_tweet' in locals():
                retweeted_is_quote = getattr(retweeted_tweet, 'is_quote_status', False)

            logger.info(
                f'Tweet {tweet_data.id}: is_retweet={is_retweet}, is_quote={is_quote}, retweeted_is_quote={retweeted_is_quote}, has_media={has_media}, content_length={len(content)}, full_text_length={len(full_text)}, quoted_tweet_id={quoted_tweet_id}, media_source={"retweeted_tweet" if is_retweet and media_source_data != tweet_data else "original"}'
            )

            # ツイートを保存
            tweet = await Tweet.create(
                tweet_id=tweet_data.id,
                target_account=target_account,
                content=content,
                full_text=full_text,
                lang=tweet_data.lang,
                likes_count=getattr(tweet_data, 'favorite_count', 0),
                retweets_count=getattr(tweet_data, 'retweet_count', 0),
                replies_count=getattr(tweet_data, 'reply_count', 0),
                quotes_count=getattr(tweet_data, 'quote_count', 0),
                views_count=getattr(tweet_data, 'view_count', 0),
                bookmark_count=getattr(tweet_data, 'bookmark_count', 0),
                is_retweet=is_retweet,
                is_quote=is_quote,
                retweeted_tweet_id=getattr(tweet_data, 'retweeted_status_id', None),
                quoted_tweet_id=quoted_tweet_id,
                is_reply=hasattr(tweet_data, 'in_reply_to_status_id'),
                in_reply_to_tweet_id=getattr(tweet_data, 'in_reply_to_status_id', None),
                in_reply_to_user_id=getattr(tweet_data, 'in_reply_to_user_id', None),
                conversation_id=getattr(tweet_data, 'conversation_id', None),
                hashtags=getattr(tweet_data, 'hashtags', None),
                urls=getattr(tweet_data, 'urls', None),
                user_mentions=getattr(tweet_data, 'user_mentions', None),
                is_possibly_sensitive=False,  # TODO delete this column
                has_media=has_media,
                # 元ツイート作者情報
                original_author_username=original_author_username,
                original_author_display_name=original_author_display_name,
                original_author_profile_image_url=original_author_profile_image_url,
                posted_at=self._parse_twitter_date(tweet_data.created_at),
                created_at=current_time,
                updated_at=current_time,
            )

            # メディア情報の保存（適切なデータソースを使用）
            if has_media:
                await self._save_tweet_media(media_source_data, tweet)

        except Exception as ex:
            logger.error(f'Failed to save tweet {tweet_data.id}', exc_info=ex)

    async def _save_quoted_tweet(
        self, quoted_tweet_data: Any, target_account: TargetAccount
    ) -> None:
        """
        引用元ツイートをデータベースに保存

        Args:
            quoted_tweet_data: 引用元ツイートのデータ
            target_account: 引用ツイートの取得元アカウント
        """
        try:
            # 既存の引用元ツイートをチェック
            existing_quoted_tweet = await Tweet.filter(
                tweet_id=quoted_tweet_data.id
            ).first()
            if existing_quoted_tweet:
                logger.info(
                    f'Quoted tweet {quoted_tweet_data.id} already exists, skipping'
                )
                return

            current_time = int(time.time())

            # 引用元ツイートの作者情報を取得
            quoted_author = getattr(quoted_tweet_data, 'user', None)
            if quoted_author:
                quoted_author_username = getattr(quoted_author, 'screen_name', None)
                quoted_author_display_name = getattr(quoted_author, 'name', None)
                quoted_author_profile_image_url = getattr(
                    quoted_author, 'profile_image_url', None
                )
            else:
                quoted_author_username = None
                quoted_author_display_name = None
                quoted_author_profile_image_url = None

            # 引用元ツイートのメディア存在チェック
            has_media = bool(getattr(quoted_tweet_data, 'media', None))

            # 引用元ツイートを保存
            quoted_tweet = await Tweet.create(
                tweet_id=quoted_tweet_data.id,
                target_account=target_account,  # 同じターゲットアカウントに紐付け
                content=quoted_tweet_data.text,
                full_text=getattr(quoted_tweet_data, 'full_text', None)
                or quoted_tweet_data.text,
                lang=quoted_tweet_data.lang,
                likes_count=getattr(quoted_tweet_data, 'favorite_count', 0),
                retweets_count=getattr(quoted_tweet_data, 'retweet_count', 0),
                replies_count=getattr(quoted_tweet_data, 'reply_count', 0),
                quotes_count=getattr(quoted_tweet_data, 'quote_count', 0),
                views_count=getattr(quoted_tweet_data, 'view_count', 0),
                bookmark_count=getattr(quoted_tweet_data, 'bookmark_count', 0),
                is_retweet=False,  # 引用元ツイート自体はリツイートではない
                is_quote=False,  # 引用元ツイート自体は引用ツイートではない
                is_quoted=True,  # 引用元ツイートとして保存
                retweeted_tweet_id=None,
                quoted_tweet_id=None,
                is_reply=hasattr(quoted_tweet_data, 'in_reply_to_status_id'),
                in_reply_to_tweet_id=getattr(
                    quoted_tweet_data, 'in_reply_to_status_id', None
                ),
                in_reply_to_user_id=getattr(
                    quoted_tweet_data, 'in_reply_to_user_id', None
                ),
                conversation_id=getattr(quoted_tweet_data, 'conversation_id', None),
                hashtags=getattr(quoted_tweet_data, 'hashtags', None),
                urls=getattr(quoted_tweet_data, 'urls', None),
                user_mentions=getattr(quoted_tweet_data, 'user_mentions', None),
                is_possibly_sensitive=False,  # TODO delete this column
                has_media=has_media,
                # 引用元ツイートの作者情報
                original_author_username=quoted_author_username,
                original_author_display_name=quoted_author_display_name,
                original_author_profile_image_url=quoted_author_profile_image_url,
                posted_at=self._parse_twitter_date(quoted_tweet_data.created_at),
                created_at=current_time,
                updated_at=current_time,
            )

            # 引用元ツイートのメディア情報も保存
            if has_media:
                await self._save_tweet_media(quoted_tweet_data, quoted_tweet)

            logger.info(f'Saved quoted tweet {quoted_tweet_data.id}')

        except Exception as ex:
            logger.error(
                f'Failed to save quoted tweet {quoted_tweet_data.id}', exc_info=ex
            )

    async def _save_tweet_media(self, tweet_data: Any, tweet: Tweet) -> None:
        """
        ツイートのメディア情報をデータベースに保存（ダウンロードは行わない）

        Args:
            tweet_data: twikit から取得したツイートデータ
            tweet: 保存済みのツイートインスタンス
        """
        try:
            media_list = getattr(tweet_data, 'media', [])
            if not media_list:
                return

            current_time = int(time.time())

            for media_item in media_list:
                try:
                    # メディア基本情報を取得
                    media_key = getattr(media_item, 'id', None)
                    media_type = getattr(media_item, 'type', 'photo')

                    if media_type == 'video':
                        media_url = media_item.streams[-1].url
                    else:
                        media_url = getattr(media_item, 'media_url', None)

                    if not media_key or not media_url:
                        logger.warning(
                            f'Media item missing key or URL for tweet {tweet.tweet_id}'
                        )
                        continue

                    # 既存のメディアレコードをチェック
                    existing_media = await Media.filter(media_key=media_key).first()
                    if existing_media:
                        logger.info(f'Media {media_key} already exists, skipping')
                        continue

                    # メディア情報をデータベースに保存
                    media = await Media.create(
                        tweet=tweet,
                        media_key=media_key,
                        media_type=media_type,
                        media_url=media_url,
                        display_url=getattr(media_item, 'display_url', None),
                        expanded_url=getattr(media_item, 'expanded_url', None),
                        width=getattr(media_item, 'width', None),
                        height=getattr(media_item, 'height', None),
                        duration_ms=getattr(media_item, 'duration_ms', None),
                        preview_image_url=getattr(
                            media_item, 'preview_image_url', None
                        ),
                        variants=getattr(media_item, 'variants', None),
                        alt_text=getattr(media_item, 'alt_text', None),
                        additional_media_info=getattr(
                            media_item, 'additional_media_info', None
                        ),
                        created_at=current_time,
                        updated_at=current_time,
                    )

                    logger.info(f'Saved media {media_key} for tweet {tweet.tweet_id}')

                except Exception as media_ex:
                    logger.error(
                        f'Failed to process media item for tweet {tweet.tweet_id}: {media_ex}'
                    )
                    # 個別のメディア処理に失敗してもツイート保存は続行

        except Exception as ex:
            logger.error(
                f'Failed to save media for tweet {tweet.tweet_id}', exc_info=ex
            )

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
        # エラー情報は必要時にのみ更新

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
