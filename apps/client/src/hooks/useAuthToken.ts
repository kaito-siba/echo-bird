import { useState, useEffect } from 'react'
import { getAuthToken } from '../integrations/tanstack-query/queries/auth'

/**
 * 認証トークンの状態をリアクティブに管理するカスタムフック
 * localStorageの変更を監視し、トークンの存在状態を返す
 */
export const useAuthToken = () => {
  const [hasToken, setHasToken] = useState(!!getAuthToken())

  useEffect(() => {
    const checkToken = () => {
      setHasToken(!!getAuthToken())
    }

    // 初回チェック
    checkToken()

    // localStorageの変更を監視（他のタブでの変更も検知）
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'token') {
        checkToken()
      }
    }

    // カスタムイベントを監視（同一タブ内での変更を検知）
    const handleTokenChange = () => {
      checkToken()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('tokenChange', handleTokenChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('tokenChange', handleTokenChange)
    }
  }, [])

  return hasToken
}

/**
 * トークンの変更を他のコンポーネントに通知するためのイベント発火関数
 */
export const notifyTokenChange = () => {
  window.dispatchEvent(new Event('tokenChange'))
}