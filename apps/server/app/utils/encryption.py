import base64
import logging
import os

from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

logger = logging.getLogger(__name__)

# 暗号化キーの生成に使用するソルト（環境変数から取得、デフォルトは開発用）
ENCRYPTION_SALT = os.getenv('ENCRYPTION_SALT', 'echo-bird-default-salt').encode()

# 暗号化マスターキー（環境変数から取得、デフォルトは開発用）
ENCRYPTION_MASTER_KEY = os.getenv(
    'ENCRYPTION_MASTER_KEY', 'echo-bird-default-master-key'
).encode()


def _get_fernet_key() -> bytes:
    """
    Fernet 暗号化用のキーを生成

    Returns:
        bytes: Fernet 暗号化キー
    """
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=ENCRYPTION_SALT,
        iterations=100000,
    )
    key = base64.urlsafe_b64encode(kdf.derive(ENCRYPTION_MASTER_KEY))
    return key


def encrypt_password(password: str) -> str:
    """
    パスワードを暗号化

    Args:
        password: 暗号化するパスワード

    Returns:
        str: 暗号化されたパスワード（Base64エンコード済み）
    """
    try:
        fernet = Fernet(_get_fernet_key())
        encrypted_password = fernet.encrypt(password.encode())
        return base64.urlsafe_b64encode(encrypted_password).decode()
    except Exception as e:
        logger.error(f'Failed to encrypt password: {e!s}')
        raise


def decrypt_password(encrypted_password: str) -> str:
    """
    暗号化されたパスワードを復号化

    Args:
        encrypted_password: 暗号化されたパスワード（Base64エンコード済み）

    Returns:
        str: 復号化されたパスワード
    """
    try:
        fernet = Fernet(_get_fernet_key())
        encrypted_bytes = base64.urlsafe_b64decode(encrypted_password.encode())
        decrypted_password = fernet.decrypt(encrypted_bytes)
        return decrypted_password.decode()
    except Exception as e:
        logger.error(f'Failed to decrypt password: {e!s}')
        raise
