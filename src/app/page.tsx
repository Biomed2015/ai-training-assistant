'use client'

import { useAuth } from '@/lib/auth'
import Link from 'next/link'

export default function HomePage() {
  const { user, loading, logout } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">AI客户培训助手</h1>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm text-gray-600">
                  {user.name || user.email} ({user.role === 'admin' ? '管理员' : '成员'})
                </span>
                <Link
                  href="/admin"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  管理后台
                </Link>
                <button
                  onClick={logout}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  退出
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                登录
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            欢迎使用AI客户培训助手
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            基于历史成交案例的AI营销培训和对话模拟系统，帮助团队学习营销技巧、提升应对能力。
          </p>
        </div>

        {/* 功能卡片 */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* AI对话 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI智能问答</h3>
            <p className="text-gray-600 text-sm mb-4">
              向AI提问，获得基于真实案例的专业建议和应对策略。
            </p>
            <Link
              href="/chat"
              className="inline-block px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              开始对话
            </Link>
          </div>

          {/* 案例浏览 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">案例浏览</h3>
            <p className="text-gray-600 text-sm mb-4">
              按行业、类型筛选查看历史成交案例，学习成功经验。
            </p>
            <Link
              href="/cases"
              className="inline-block px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
            >
              浏览案例
            </Link>
          </div>

          {/* 模拟训练 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-4xl mb-4">🎭</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">模拟训练</h3>
            <p className="text-gray-600 text-sm mb-4">
              模拟客户场景进行对话练习，提升实战应对能力。
            </p>
            <Link
              href="/training"
              className="inline-block px-4 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
            >
              开始训练
            </Link>
          </div>
        </div>

        {/* 快捷链接 */}
        <div className="mt-12 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">最近案例</h3>
          <p className="text-gray-500 text-sm">暂无案例数据，请先导入案例。</p>
        </div>
      </main>

      {/* 底部 */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-4 text-center text-sm text-gray-500">
          AI客户培训助手 © 2026
        </div>
      </footer>
    </div>
  )
}
