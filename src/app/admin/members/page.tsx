'use client'

import { useState, useEffect } from 'react'
import { supabase, User } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AdminMembersPage() {
  const { user: currentUser, loading: authLoading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<'admin' | 'member'>('member')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading) {
      if (!currentUser || currentUser.role !== 'admin') {
        router.push('/')
        return
      }
      fetchUsers()
    }
  }, [currentUser, authLoading, router])

  async function fetchUsers() {
    setLoading(true)
    const { data } = await supabase.from('users').select('*').order('created_at')
    if (data) setUsers(data)
    setLoading(false)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    })

    if (authError) {
      setError(authError.message)
      return
    }

    if (authData.user) {
      // Create user profile
      await supabase.from('users').insert({
        id: authData.user.id,
        email,
        name,
        role
      })
      resetForm()
      fetchUsers()
    }
  }

  async function handleDelete(id: string) {
    if (id === currentUser?.id) {
      alert('不能删除自己')
      return
    }
    if (confirm('确定要删除这个成员吗？')) {
      await supabase.from('users').delete().eq('id', id)
      // Also delete from auth
      await supabase.auth.admin.deleteUser(id)
      fetchUsers()
    }
  }

  async function handleUpdateRole(id: string, newRole: 'admin' | 'member') {
    await supabase.from('users').update({ role: newRole }).eq('id', id)
    fetchUsers()
  }

  function resetForm() {
    setShowForm(false)
    setEmail('')
    setPassword('')
    setName('')
    setRole('member')
    setError('')
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
            <h1 className="text-lg font-semibold text-gray-900">成员管理</h1>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(true) }}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            + 添加成员
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* 添加表单 */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">添加新成员</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded text-sm">{error}</div>
              )}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">初始密码</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                    minLength={6}
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">角色</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as 'admin' | 'member')}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="member">成员</option>
                    <option value="admin">管理员</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  创建
                </button>
                <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                  取消
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 成员列表 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">姓名</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">邮箱</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">角色</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{u.name || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                  <td className="px-4 py-3 text-sm">
                    <select
                      value={u.role}
                      onChange={e => handleUpdateRole(u.id, e.target.value as 'admin' | 'member')}
                      className="text-sm border rounded px-2 py-1"
                      disabled={u.id === currentUser?.id}
                    >
                      <option value="member">成员</option>
                      <option value="admin">管理员</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {u.id !== currentUser?.id && (
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        删除
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
