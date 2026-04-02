'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase, Case } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import Link from 'next/link'

export default function CaseDetailPage() {
  const params = useParams()
  const { user, loading: authLoading } = useAuth()
  const [caseData, setCaseData] = useState<Case | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchCase()
    }
  }, [params.id])

  async function fetchCase() {
    setLoading(true)
    const { data } = await supabase
      .from('cases')
      .select('*')
      .eq('id', params.id)
      .single()
    setCaseData(data)
    setLoading(false)
  }

  if (loading || authLoading) {
    return <div className="flex justify-center p-8">加载中...</div>
  }

  if (!caseData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">案例不存在</p>
          <Link href="/cases" className="text-blue-600 hover:text-blue-800">返回案例列表</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/cases" className="text-sm text-gray-500 hover:text-gray-700">
            ← 返回案例列表
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <article className="bg-white rounded-lg shadow p-6">
          <header className="mb-6 pb-4 border-b">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{caseData.title}</h1>
            <div className="flex gap-2">
              {caseData.industry && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded">
                  {caseData.industry}
                </span>
              )}
              {caseData.case_type && (
                <span className="px-2 py-1 bg-blue-50 text-blue-600 text-sm rounded">
                  {caseData.case_type}
                </span>
              )}
            </div>
          </header>

          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {caseData.content}
            </div>
          </div>

          <footer className="mt-8 pt-4 border-t text-sm text-gray-500">
            创建于：{new Date(caseData.created_at).toLocaleDateString('zh-CN')}
          </footer>
        </article>
      </main>
    </div>
  )
}
