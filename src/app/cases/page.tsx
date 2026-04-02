'use client'

import { useState, useEffect } from 'react'
import { supabase, Case } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import Link from 'next/link'

export default function CasesPage() {
  const { user, loading: authLoading } = useAuth()
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [industryFilter, setIndustryFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!authLoading && user) {
      fetchCases()
    }
  }, [user, authLoading])

  async function fetchCases() {
    setLoading(true)
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setCases(data)
    }
    setLoading(false)
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">请先登录</p>
          <Link href="/login" className="text-blue-600 hover:text-blue-800">
            去登录
          </Link>
        </div>
      </div>
    )
  }

  const filteredCases = cases.filter(c => {
    const matchIndustry = !industryFilter || c.industry === industryFilter
    const matchSearch = !searchTerm ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.content.toLowerCase().includes(searchTerm.toLowerCase())
    return matchIndustry && matchSearch
  })

  const industries = [...new Set(cases.map(c => c.industry).filter(Boolean))]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
              ← 返回首页
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">案例浏览</h1>
          </div>
          <span className="text-sm text-gray-500">共 {cases.length} 个案例</span>
        </div>
      </header>

      {/* 主内容 */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* 筛选栏 */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="搜索案例..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="w-48">
              <select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">全行业</option>
                {industries.filter(Boolean).map(ind => (
                  <option key={ind as string} value={ind as string}>{ind as string}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 案例列表 */}
        {filteredCases.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-gray-600">
              {cases.length === 0 ? '暂无案例数据' : '没有找到匹配的案例'}
            </p>
            {user.role === 'admin' && cases.length === 0 && (
              <Link
                href="/admin/cases"
                className="inline-block mt-4 text-blue-600 hover:text-blue-800"
              >
                去导入案例 →
              </Link>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCases.map(c => (
              <Link
                key={c.id}
                href={`/cases/${c.id}`}
                className="bg-white rounded-lg shadow p-4 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900 line-clamp-2">{c.title}</h3>
                </div>
                {c.industry && (
                  <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    {c.industry}
                  </span>
                )}
                {c.case_type && (
                  <span className="inline-block px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded ml-2">
                    {c.case_type}
                  </span>
                )}
                <p className="text-sm text-gray-500 mt-2 line-clamp-3">
                  {c.content.substring(0, 150)}...
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
