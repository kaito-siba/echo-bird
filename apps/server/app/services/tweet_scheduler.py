import logging
import random
from datetime import datetime, timedelta

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

from app.constants import SCHEDULER_INITIAL_DELAY_MAX_MINUTES, SCHEDULER_JITTER_SECONDS
from app.models.target_account import TargetAccount
from app.models.twitter_account import TwitterAccount
from app.utils.twitter_service import TwitterService

logger = logging.getLogger(__name__)


class TweetScheduler:
    """
    ツイート定期取得を管理するスケジューラー

    各ターゲットアカウントの fetch_interval_minutes 設定に基づいて
    定期的にツイートを取得するバックグラウンドタスクを管理する
    """

    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        self.twitter_service = TwitterService()
        self.scheduled_jobs: dict[
            int, str
        ] = {}  # target_account_id -> job_id のマッピング

    async def start(self) -> None:
        """
        スケジューラーを開始し、既存のアクティブなターゲットアカウントの
        定期取得タスクをスケジュールする
        """
        try:
            # 既存のアクティブなターゲットアカウントを取得
            active_accounts = await TargetAccount.filter(is_active=True).all()

            # 各アカウントの定期取得タスクをスケジュール
            for account in active_accounts:
                await self._schedule_account_fetch(account)

            # スケジューラーを開始
            self.scheduler.start()
            logger.info(
                f'Tweet scheduler started with {len(active_accounts)} active accounts'
            )

        except Exception as ex:
            logger.error(f'Failed to start tweet scheduler: {ex!s}', exc_info=ex)
            raise

    async def stop(self) -> None:
        """
        スケジューラーを停止する
        """
        try:
            self.scheduler.shutdown(wait=False)
            logger.info('Tweet scheduler stopped')
        except Exception as ex:
            logger.error(f'Failed to stop tweet scheduler: {ex!s}', exc_info=ex)

    async def schedule_account(self, target_account: TargetAccount) -> None:
        """
        指定されたターゲットアカウントの定期取得タスクをスケジュールする

        Args:
            target_account: スケジュールするターゲットアカウント
        """
        if not target_account.is_active:
            logger.info(f'Skipping inactive account: @{target_account.username}')
            return

        await self._schedule_account_fetch(target_account)

    async def unschedule_account(self, target_account_id: int) -> None:
        """
        指定されたターゲットアカウントの定期取得タスクを削除する

        Args:
            target_account_id: 削除するターゲットアカウントのID
        """
        job_id = self.scheduled_jobs.get(target_account_id)
        if job_id:
            try:
                self.scheduler.remove_job(job_id)
                del self.scheduled_jobs[target_account_id]
                logger.info(f'Unscheduled job for target account {target_account_id}')
            except Exception as ex:
                logger.error(f'Failed to remove job {job_id}: {ex!s}', exc_info=ex)

    async def reschedule_account(self, target_account: TargetAccount) -> None:
        """
        指定されたターゲットアカウントの定期取得タスクを再スケジュールする
        （設定変更時に使用）

        Args:
            target_account: 再スケジュールするターゲットアカウント
        """
        # 既存のジョブを削除
        await self.unschedule_account(target_account.id)

        # 新しい設定でスケジュール
        if target_account.is_active:
            await self._schedule_account_fetch(target_account)

    async def _schedule_account_fetch(self, target_account: TargetAccount) -> None:
        """
        ターゲットアカウントの定期取得タスクを内部的にスケジュールする

        より自然なAPIコールパターンを作るため、以下のランダム化を適用：
        - 初回実行時刻のランダム遅延
        - フェッチ間隔のジッター（揺らぎ）

        Args:
            target_account: スケジュールするターゲットアカウント
        """
        try:
            # ジョブIDを生成
            job_id = f'fetch_tweets_{target_account.id}'

            # 既存のジョブがあれば削除
            if target_account.id in self.scheduled_jobs:
                await self.unschedule_account(target_account.id)

            # 初回実行時刻をランダムに遅延（0～30分の範囲）
            initial_delay_minutes = random.randint(
                0, SCHEDULER_INITIAL_DELAY_MAX_MINUTES
            )
            start_time = datetime.now() + timedelta(minutes=initial_delay_minutes)

            # 定期取得タスクをスケジュール（ジッター付き）
            self.scheduler.add_job(
                func=self._fetch_tweets_for_account,
                trigger=IntervalTrigger(
                    minutes=target_account.fetch_interval_minutes,
                    start_date=start_time,
                    jitter=SCHEDULER_JITTER_SECONDS,  # ±5分のランダム要素
                ),
                args=[target_account.id],
                id=job_id,
                name=f'Fetch tweets for @{target_account.username}',
                replace_existing=True,
            )

            # ジョブIDを記録
            self.scheduled_jobs[target_account.id] = job_id

            logger.info(
                f'Scheduled tweet fetch for @{target_account.username} '
                f'every {target_account.fetch_interval_minutes} minutes '
                f'(initial delay: {initial_delay_minutes}min, jitter: ±{SCHEDULER_JITTER_SECONDS // 60}min)'
            )

        except Exception as ex:
            logger.error(
                f'Failed to schedule tweet fetch for account {target_account.id}: {ex!s}',
                exc_info=ex,
            )

    async def _fetch_tweets_for_account(self, target_account_id: int) -> None:
        """
        指定されたターゲットアカウントのツイートを取得する
        （スケジューラーから定期実行される）

        Args:
            target_account_id: ツイートを取得するターゲットアカウントのID
        """
        try:
            # ターゲットアカウントを取得 (userリレーションも一緒に取得)
            target_account = (
                await TargetAccount.filter(id=target_account_id)
                .prefetch_related('user')
                .first()
            )
            if not target_account:
                logger.error(f'Target account {target_account_id} not found')
                return

            # 非アクティブなアカウントはスキップ
            if not target_account.is_active:
                logger.info(f'Skipping inactive account: @{target_account.username}')
                await self.unschedule_account(target_account_id)
                return

            # userオブジェクトを事前に取得
            user = await target_account.user

            # アクティブなTwitterアカウントを取得
            # TODO: 将来的にはターゲットアカウントごとに使用するTwitterアカウントを指定できるようにする
            twitter_account = await TwitterAccount.filter(
                user=user, is_active=True
            ).first()

            if not twitter_account:
                logger.error(f'No active Twitter account found for user {user.id}')
                return

            # ツイートを取得
            fetched_count = await self.twitter_service.fetch_user_tweets(
                twitter_account=twitter_account, target_account=target_account
            )

            logger.info(
                f'Scheduled fetch completed for @{target_account.username}: '
                f'{fetched_count} tweets fetched'
            )

        except Exception as ex:
            logger.error(
                f'Failed to fetch tweets for account {target_account_id}: {ex!s}',
                exc_info=ex,
            )

    def get_scheduled_jobs_info(self) -> list[dict]:
        """
        現在スケジュールされているジョブの情報を取得する

        Returns:
            ジョブ情報のリスト
        """
        jobs_info = []
        for job in self.scheduler.get_jobs():
            jobs_info.append(
                {
                    'id': job.id,
                    'name': job.name,
                    'next_run_time': job.next_run_time.isoformat()
                    if job.next_run_time
                    else None,
                    'trigger': str(job.trigger),
                }
            )
        return jobs_info
