import { useQuery } from '@tanstack/react-query'
import { currentUserQueryOptions } from '../integrations/tanstack-query/queries/auth'
import { useAuthToken } from '../hooks/useAuthToken'
import Sidebar from './Sidebar'
import { layoutContainer, mainContent, mainContentWithSidebar } from '../styles/layout.css.ts'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  // トークンの状態をリアクティブに管理
  const hasToken = useAuthToken()

  // トークンがある場合のみユーザー情報を取得
  const { data: currentUser, isLoading } = useQuery({
    ...currentUserQueryOptions,
    enabled: hasToken, // トークンがある場合のみクエリを実行
  })

  // ログインしているユーザーの場合はサイドバーを表示
  const showSidebar = !isLoading && currentUser

  return (
    <div className={layoutContainer}>
      {showSidebar && <Sidebar />}
      <main className={showSidebar ? mainContentWithSidebar : mainContent}>
        {children}
      </main>
    </div>
  )
}