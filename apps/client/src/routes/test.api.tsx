import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { apiRequest, API_ENDPOINTS } from '../lib/api';

export const Route = createFileRoute('/test/api')({
  component: ApiTestPage,
});

function ApiTestPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await apiRequest<{ status: string }>(API_ENDPOINTS.health);
      setResult(`✅ 疎通成功: ${response.status}`);
    } catch (err) {
      setError(`❌ 疎通失敗: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>API 疎通テスト</h1>

      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={testConnection}
          disabled={isLoading}
          style={{
            padding: '1rem 2rem',
            fontSize: '1rem',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1,
          }}
        >
          {isLoading ? '通信中...' : 'サーバー疎通テスト'}
        </button>
      </div>

      {result && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#d4edda',
          color: '#155724',
          border: '1px solid #c3e6cb',
          borderRadius: '4px',
          marginBottom: '1rem',
        }}>
          {result}
        </div>
      )}

      {error && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          marginBottom: '1rem',
        }}>
          {error}
        </div>
      )}

      <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#666' }}>
        <h3>設定情報</h3>
        <ul>
          <li>クライアント: http://localhost:5173</li>
          <li>サーバー: http://localhost:8000</li>
          <li>API Base URL: /api/v1 (Viteプロキシ経由)</li>
          <li>テストエンドポイント: /api/v1/health</li>
        </ul>
      </div>
    </div>
  );
}