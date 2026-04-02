'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import { chatWithAI } from '@/lib/minimax'
import Link from 'next/link'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatPage() {
  const { user, loading: authLoading } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (authLoading) {
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

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setError('')

    try {
      const history = messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))
      const aiResponse = await chatWithAI(input, history)
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }])
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'AI响应失败，请稍后重试'
      setError(errorMessage)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
              ← 返回首页
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">AI智能问答</h1>
          </div>
        </div>
      </header>

      {/* 聊天区域 */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow min-h-[500px] flex flex-col">
          {/* 欢迎信息 */}
          {messages.length === 0 && (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <div className="text-5xl mb-4">💬</div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  您好，我是AI培训助手
                </h2>
                <p className="text-gray-600 max-w-md">
                  请描述您遇到的客户问题或场景，例如：
                  <br />
                  <span className="text-sm text-gray-500">
                    "客户嫌价格太贵怎么办？"
                  </span>
                  <br />
                  <span className="text-sm text-gray-500">
                    "客户说再考虑考虑，如何跟进？"
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* 消息列表 */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-600 p-3 rounded-lg">
                  AI思考中...
                </div>
              </div>
            )}
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mx-4 mb-2 text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          {/* 输入框 */}
          <form onSubmit={handleSend} className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="输入您的问题..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                发送
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
