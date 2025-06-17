import time
import uuid
from dataclasses import dataclass
from typing import Any

from app.models.user import User


@dataclass
class TFASession:
    """
    TFA 認証セッション情報を保持するデータクラス
    
    Twitter の TFA 認証中に一時的に保存される情報を管理する
    """
    
    session_id: str
    user: User
    username: str
    email: str
    password: str
    flow_state: dict[str, Any] | None  # twikit の Flow オブジェクトの状態
    created_at: float
    expires_at: float
    
    def is_expired(self) -> bool:
        """
        セッションが期限切れかどうかを判定
        
        Returns:
            bool: 期限切れの場合 True
        """
        return time.time() > self.expires_at


class SessionManager:
    """
    TFA 認証セッション管理クラス
    
    Twitter の 2FA 認証過程で必要な情報を一時的に保存・管理する
    メモリベースの実装で、セッション情報は辞書に保存される
    """
    
    def __init__(self, session_timeout: int = 300):  # デフォルト 5 分
        """
        セッションマネージャーを初期化
        
        Args:
            session_timeout: セッション有効期限（秒）
        """
        self._sessions: dict[str, TFASession] = {}
        self._session_timeout = session_timeout
    
    
    def create_session(
        self,
        user: User,
        username: str,
        email: str,
        password: str,
        flow_state: dict[str, Any] | None = None,
    ) -> TFASession:
        """
        新しい TFA セッションを作成
        
        Args:
            user: EchoBird のユーザー
            username: Twitter ユーザー名
            email: Twitter メールアドレス
            password: Twitter パスワード
            flow_state: twikit の Flow オブジェクトの状態
            
        Returns:
            TFASession: 作成されたセッション情報
        """
        session_id = str(uuid.uuid4())
        current_time = time.time()
        
        session = TFASession(
            session_id=session_id,
            user=user,
            username=username,
            email=email,
            password=password,
            flow_state=flow_state,
            created_at=current_time,
            expires_at=current_time + self._session_timeout,
        )
        
        self._sessions[session_id] = session
        
        # 期限切れセッションをクリーンアップ
        self._cleanup_expired_sessions()
        
        return session
    
    
    def get_session(self, session_id: str) -> TFASession | None:
        """
        セッション ID からセッション情報を取得
        
        Args:
            session_id: セッション ID
            
        Returns:
            TFASession | None: セッション情報、存在しないか期限切れの場合は None
        """
        session = self._sessions.get(session_id)
        
        if session is None:
            return None
            
        if session.is_expired():
            # 期限切れセッションを削除
            del self._sessions[session_id]
            return None
            
        return session
    
    
    def update_session_flow_state(
        self, 
        session_id: str, 
        flow_state: dict[str, Any],
    ) -> bool:
        """
        セッションの Flow 状態を更新
        
        Args:
            session_id: セッション ID
            flow_state: 更新する Flow 状態
            
        Returns:
            bool: 更新成功時 True、セッションが存在しない場合 False
        """
        session = self.get_session(session_id)
        
        if session is None:
            return False
            
        session.flow_state = flow_state
        return True
    
    
    def delete_session(self, session_id: str) -> bool:
        """
        セッションを削除
        
        Args:
            session_id: 削除するセッション ID
            
        Returns:
            bool: 削除成功時 True、セッションが存在しない場合 False
        """
        if session_id in self._sessions:
            del self._sessions[session_id]
            return True
        return False
    
    
    def _cleanup_expired_sessions(self) -> None:
        """
        期限切れセッションをクリーンアップ
        
        メモリリークを防ぐため、定期的に期限切れセッションを削除する
        """
        current_time = time.time()
        expired_session_ids = [
            session_id 
            for session_id, session in self._sessions.items()
            if session.expires_at < current_time
        ]
        
        for session_id in expired_session_ids:
            del self._sessions[session_id]
    
    
    def get_session_count(self) -> int:
        """
        現在アクティブなセッション数を取得（デバッグ用）
        
        Returns:
            int: アクティブセッション数
        """
        self._cleanup_expired_sessions()
        return len(self._sessions)


# グローバルセッションマネージャーインスタンス
session_manager = SessionManager()