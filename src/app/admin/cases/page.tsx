'use client'

import { useState, useEffect } from 'react'
import { supabase, Case } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AdminCasesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCase, setEditingCase] = useState<Case | null>(null)

  // Form state
  const [title, setTitle] = useState('')
  const [industry, setIndustry] = useState('')
  const [caseType, setCaseType] = useState('')
  const [content, setContent] = useState('')

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'admin') {
        router.push('/')
        return
      }
      fetchCases()
    }
  }, [user, authLoading, router])

  async function fetchCases() {
    setLoading(true)
    const { data } = await supabase
      .from('cases')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setCases(data)
    setLoading(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (editingCase) {
      // Update
      await supabase
        .from('cases')
        .update({ title, industry, case_type: caseType, content, updated_at: new Date().toISOString() })
        .eq('id', editingCase.id)
    } else {
      // Create
      await supabase
        .from('cases')
        .insert({ title, industry, case_type: caseType, content })
    }
    resetForm()
    fetchCases()
  }

  async function handleDelete(id: string) {
    if (confirm('确定要删除这个案例吗？')) {
      await supabase.from('cases').delete().eq('id', id)
      fetchCases()
    }
  }

  function editCase(c: Case) {
    setEditingCase(c)
    setTitle(c.title)
    setIndustry(c.industry || '')
    setCaseType(c.case_type || '')
    setContent(c.content)
    setShowForm(true)
  }

  function resetForm() {
    setShowForm(false)
    setEditingCase(null)
    setTitle('')
    setIndustry('')
    setCaseType('')
    setContent('')
  }

  if (authLoading || loading) {
    return <div className="flex justify-center p-8">加载中...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-700">← 管理后台</Link>
            <h1 className="text-lg font-semibold text-gray-900">案例管理</h1>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(true) }}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            + 添加案例
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* 添加/编辑表单 */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">
              {editingCase ? '编辑案例' : '添加新案例'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">行业</label>
                  <input
                    type="text"
                    value={industry}
                    onChange={e => setIndustry(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="如：教育培训"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">类型</label>
                <input
                  type="text"
                  value={caseType}
                  onChange={e => setCaseType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="如：企业培训"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">案例内容</label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md h-64"
                  placeholder="粘贴案例内容..."
                  required
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  保存
                </button>
                <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                  取消
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 案例列表 */}
        {cases.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-gray-600">暂无案例</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">标题</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">行业</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">类型</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {cases.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{c.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{c.industry || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{c.case_type || '-'}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button onClick={() => editCase(c)} className="text-blue-600 hover:text-blue-800 text-sm">编辑</button>
                      <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:text-red-800 text-sm">删除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
