"""
MinIO S3互換ストレージクライアント
ツイートに添付されたメディアファイルの保存・取得を行う
"""

import json
import os

import boto3
from botocore.config import Config
from botocore.exceptions import ClientError

from app.constants import MEDIA_BUCKET_NAME


class S3Client:
    """MinIO S3互換クライアント"""

    def __init__(self):
        """S3クライアントを初期化"""
        self.endpoint_url = os.getenv('MINIO_ENDPOINT_URL', 'http://localhost:9000')
        self.access_key = os.getenv('MINIO_ACCESS_KEY', 'minioadmin')
        self.secret_key = os.getenv('MINIO_SECRET_KEY', 'minioadmin123')
        self.region_name = os.getenv('MINIO_REGION', 'us-east-1')

        # S3クライアントの設定
        self.s3_client = boto3.client(
            's3',
            endpoint_url=self.endpoint_url,
            aws_access_key_id=self.access_key,
            aws_secret_access_key=self.secret_key,
            region_name=self.region_name,
            config=Config(
                signature_version='s3v4',
                s3={'addressing_style': 'path'},
            ),
        )

    async def create_bucket_if_not_exists(self, bucket_name: str) -> bool:
        """バケットが存在しない場合は作成し、パブリック読み込みポリシーを設定する"""
        try:
            self.s3_client.head_bucket(Bucket=bucket_name)
            print(f'Bucket {bucket_name} already exists')

            # バケットが存在する場合でも、ポリシーを確認・設定
            await self._set_public_read_policy(bucket_name)
            return True
        except ClientError as ex:
            error_code = ex.response['Error']['Code']
            if error_code == '404':
                # バケットが存在しない場合は作成
                try:
                    self.s3_client.create_bucket(Bucket=bucket_name)
                    print(f'Created bucket {bucket_name}')

                    # パブリック読み込みポリシーを設定
                    await self._set_public_read_policy(bucket_name)
                    return True
                except ClientError as create_ex:
                    print(f'Failed to create bucket {bucket_name}: {create_ex}')
                    return False
            else:
                print(f'Error checking bucket {bucket_name}: {ex}')
                return False

    async def _set_public_read_policy(self, bucket_name: str) -> bool:
        """バケットにパブリック読み込みポリシーを設定"""
        # MinIOでの匿名アクセス用ポリシー形式
        public_read_policy = {
            'Version': '2012-10-17',
            'Statement': [
                {
                    'Effect': 'Allow',
                    'Principal': '*',
                    'Action': ['s3:GetObject'],
                    'Resource': [f'arn:aws:s3:::{bucket_name}/*'],
                },
                {
                    'Effect': 'Allow',
                    'Principal': '*',
                    'Action': ['s3:ListBucket'],
                    'Resource': [f'arn:aws:s3:::{bucket_name}'],
                },
            ],
        }

        try:
            # 現在のポリシーを確認
            try:
                current_policy = self.s3_client.get_bucket_policy(Bucket=bucket_name)
                print(f'Current policy for {bucket_name}: {current_policy["Policy"]}')
            except ClientError as get_ex:
                if get_ex.response['Error']['Code'] == 'NoSuchBucketPolicy':
                    print(f'No existing policy for {bucket_name}, setting new policy')
                else:
                    print(
                        f'Warning: Could not get current policy for {bucket_name}: {get_ex}'
                    )

            # 新しいポリシーを設定
            policy_json = json.dumps(public_read_policy)
            self.s3_client.put_bucket_policy(Bucket=bucket_name, Policy=policy_json)
            print(f'Successfully set public read policy for bucket {bucket_name}')

            # ポリシー設定を確認
            try:
                verification_policy = self.s3_client.get_bucket_policy(
                    Bucket=bucket_name
                )
                print(
                    f'Verified policy for {bucket_name}: {verification_policy["Policy"]}'
                )
                return True
            except ClientError as verify_ex:
                print(
                    f'Warning: Could not verify policy for {bucket_name}: {verify_ex}'
                )
                return False

        except ClientError as ex:
            print(f'Error: Failed to set public policy for {bucket_name}: {ex}')
            print(f'Error details: {ex.response}')
            return False

    async def upload_file(
        self,
        file_data: bytes,
        bucket_name: str,
        object_key: str,
        content_type: str | None = None,
    ) -> bool:
        """ファイルをMinIOにアップロードする"""
        try:
            extra_args = {}
            if content_type:
                extra_args['ContentType'] = content_type

            self.s3_client.put_object(
                Bucket=bucket_name,
                Key=object_key,
                Body=file_data,
                **extra_args,
            )
            return True
        except ClientError as ex:
            print(f'Failed to upload file {object_key}: {ex}')
            return False

    async def download_file(self, bucket_name: str, object_key: str) -> bytes | None:
        """MinIOからファイルをダウンロードする"""
        try:
            response = self.s3_client.get_object(Bucket=bucket_name, Key=object_key)
            return response['Body'].read()
        except ClientError as ex:
            print(f'Failed to download file {object_key}: {ex}')
            return None

    async def delete_file(self, bucket_name: str, object_key: str) -> bool:
        """MinIOからファイルを削除する"""
        try:
            self.s3_client.delete_object(Bucket=bucket_name, Key=object_key)
            return True
        except ClientError as ex:
            print(f'Failed to delete file {object_key}: {ex}')
            return False

    def get_public_url(self, bucket_name: str, object_key: str) -> str:
        """パブリックアクセス用の直接URLを生成する"""
        return f'{self.endpoint_url}/{bucket_name}/{object_key}'

    async def file_exists(self, bucket_name: str, object_key: str) -> bool:
        """ファイルがMinIOに存在するかチェックする"""
        try:
            self.s3_client.head_object(Bucket=bucket_name, Key=object_key)
            return True
        except ClientError as ex:
            error_code = ex.response['Error']['Code']
            if error_code == '404':
                return False
            else:
                print(f'Error checking file {object_key}: {ex}')
                return False


# グローバル S3 クライアントインスタンス
s3_client = S3Client()


async def initialize_media_bucket() -> bool:
    """メディア保存用バケットを初期化する"""
    return await s3_client.create_bucket_if_not_exists(MEDIA_BUCKET_NAME)


async def upload_media_file(
    media_key: str,
    file_data: bytes,
    content_type: str | None = None,
) -> bool:
    """メディアファイルをアップロードする"""
    object_key = f'media/{media_key}'
    return await s3_client.upload_file(
        file_data, MEDIA_BUCKET_NAME, object_key, content_type
    )


async def download_media_file(media_key: str) -> bytes | None:
    """メディアファイルをダウンロードする"""
    object_key = f'media/{media_key}'
    return await s3_client.download_file(MEDIA_BUCKET_NAME, object_key)


async def delete_media_file(media_key: str) -> bool:
    """メディアファイルを削除する"""
    object_key = f'media/{media_key}'
    return await s3_client.delete_file(MEDIA_BUCKET_NAME, object_key)


def get_media_public_url(media_key: str) -> str:
    """メディアファイルのパブリックアクセス用URLを取得する"""
    object_key = f'media/{media_key}'
    return s3_client.get_public_url(MEDIA_BUCKET_NAME, object_key)


async def media_file_exists(media_key: str) -> bool:
    """メディアファイルが存在するかチェックする"""
    object_key = f'media/{media_key}'
    return await s3_client.file_exists(MEDIA_BUCKET_NAME, object_key)
