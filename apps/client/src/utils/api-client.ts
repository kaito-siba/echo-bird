import {
  getAuthToken,
  removeAuthToken,
} from '../integrations/tanstack-query/queries/auth';

// APIベースURL（Viteプロキシ設定により相対パスを使用）
const API_BASE_URL = '/api/v1';

// APIエラーレスポンスの型定義
interface ApiError {
  detail: string;
}

// APIクライアントのエラークラス
export class ApiClientError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: Response,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

// 認証エラー時のリダイレクト処理
const handleAuthError = () => {
  // 既にログインページにいる場合は処理しない（無限ループ防止）
  if (window.location.pathname === '/login') {
    return;
  }

  // トークンを削除
  removeAuthToken();

  // 現在のパスを保存（ログイン後にリダイレクトするため）
  const currentPath = window.location.pathname + window.location.search;
  sessionStorage.setItem('redirectAfterLogin', currentPath);

  // ログインページにリダイレクト
  window.location.href = '/login';
};

// 統一されたAPIクライアント関数
export const apiClient = async (
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> => {
  const token = getAuthToken();

  // デフォルトヘッダーを設定
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // 認証トークンが存在する場合は Authorization ヘッダーを追加
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  const url = endpoint.startsWith('/')
    ? `${API_BASE_URL}${endpoint}`
    : endpoint;

  try {
    const response = await fetch(url, config);

    // 認証エラー（401 Unauthorized）の場合は自動でリダイレクト
    if (response.status === 401) {
      handleAuthError();
      throw new ApiClientError('認証に失敗しました', 401, response);
    }

    // その他のHTTPエラーの場合
    if (!response.ok) {
      let errorMessage = 'APIリクエストに失敗しました';

      try {
        const errorData: ApiError = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch {
        // JSON解析に失敗した場合はデフォルトメッセージを使用
      }

      throw new ApiClientError(errorMessage, response.status, response);
    }

    return response;
  } catch (error) {
    // ネットワークエラーなどの場合
    if (error instanceof ApiClientError) {
      throw error;
    }

    throw new ApiClientError('ネットワークエラーが発生しました', 0);
  }
};

// JSONレスポンスを期待するAPIクライアント
export const apiClientJson = async <T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> => {
  const response = await apiClient(endpoint, options);
  return response.json();
};

// 認証が不要なAPIリクエスト用のクライアント
export const apiClientPublic = async (
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const config: RequestInit = {
    ...options,
    headers,
  };

  const url = endpoint.startsWith('/')
    ? `${API_BASE_URL}${endpoint}`
    : endpoint;

  const response = await fetch(url, config);

  if (!response.ok) {
    let errorMessage = 'APIリクエストに失敗しました';

    try {
      const errorData: ApiError = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch {
      // JSON解析に失敗した場合はデフォルトメッセージを使用
    }

    throw new ApiClientError(errorMessage, response.status, response);
  }

  return response;
};

// 認証が不要なJSONレスポンスを期待するAPIクライアント
export const apiClientPublicJson = async <T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> => {
  const response = await apiClientPublic(endpoint, options);
  return response.json();
};
