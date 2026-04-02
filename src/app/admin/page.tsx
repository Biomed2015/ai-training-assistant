'use client'

import { useAuth } from '@/lib/auth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    router.push('/')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
              ← 返回首页
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">管理后台</h1>
          </div>
          <span className="text-sm text-gray-500">
            管理员：{user.name || user.email}
          </span>
        </div>
      </header>

      {/* 主内容 */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-6">
          {/* 案例管理 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-3xl">📚</div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">案例管理</h2>
                <p className="text-sm text-gray-500">上传、编辑、删除案例</p>
              </div>
            </div>
            <Link
              href="/admin/cases"
              className="inline-block px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              进入管理
            </Link>
          </div>

          {/* 成员管理 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-3xl">👥</div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">成员管理</h2>
                <p className="text-sm text-gray-500">添加、移除团队成员</p>
              </div>
            </div>
            <Link
              href="/admin/members"
              className="inline-block px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
            >
              进入管理
            </Link>
          </div>
        </div>

        {/* 系统状态 */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">系统概览</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">-</div>
              <div className="text-sm text-gray-500">案例总数</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">-</div>
              <div className="text-sm text-gray-500">成员总数</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">-</div>
              <div className="text-sm text-gray-500">对话次数</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
