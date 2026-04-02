'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import { chatWithAI } from '@/lib/minimax'
import Link from 'next/link'

const SCENARIOS = [
  { id: 'price', title: '客户嫌价格太贵', description: '模拟客户抱怨价格高、不肯下单的场景' },
  { id: 'consider', title: '客户说要考虑考虑', description: '模拟客户犹豫不决、需要跟进的场景' },
  { id: 'compare', title: '客户在对比别家', description: '模拟客户提到竞争对手、需要突出优势的的场景' },
  { id: 'budget', title: '客户预算不足', description: '模拟客户预算有限、需要引导加价的场景' },
]

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function TrainingPage() {
  const { user, loading: authLoading } = useAuth()
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  if (authLoading) {
    return <div className="flex justify-center p-8">加载中...</div>
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">请先登录</p>
          <Link href="/login" className="text-blue-600 hover:text-blue-800">去登录</Link>
        </div>
      </div>
    )
  }

  async function startScenario(scenarioId: string) {
    setSelectedScenario(scenarioId)
    setMessages([])
    const scenario = SCENARIOS.find(s => s.id === scenarioId)
    const systemPrompt = `你是一个潜在客户，正在咨询培训服务。请扮演客户的角色，根据以下场景进行对话：

场景：${scenario?.title}
描述：${scenario?.description}

请用自然、真实的方式与销售人员对话，模拟真实客户可能会有的反应和提问。`
    setMessages([
      { role: 'assistant', content: '你好，请问你们提供培训服务吗？我想了解一下。' }
    ])
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const scenario = SCENARIOS.find(s => s.id === selectedScenario)
      const systemPrompt = `你是一个潜在客户，正在咨询培训服务。请扮演客户的角色，根据以下场景进行对话：

场景：${scenario?.title}
描述：${scenario?.description}

请用自然、真实的方式与销售人员对话，模拟真实客户可能会有的反应和提问。`

      const aiResponse = await chatWithAI([
        { role: 'system', content: systemPrompt },
        ...messages,
        userMessage
      ])
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: '抱歉，网络波动，请重试。' }])
    }
    setLoading(false)
  }

  function reset() {
    setSelectedScenario(null)
    setMessages([])
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">← 返回首页</Link>
            <h1 className="text-lg font-semibold text-gray-900">模拟训练</h1>
          </div>
          {selectedScenario && (
            <button onClick={reset} className="text-sm text-gray-500 hover:text-gray-700">
              选择其他场景
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {!selectedScenario ? (
          <>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">选择训练场景</h2>
              <p className="text-gray-600">选择一个客户场景，开始模拟对话训练</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {SCENARIOS.map(s => (
                <button
                  key={s.id}
                  onClick={() => startScenario(s.id)}
                  className="bg-white rounded-lg shadow p-6 text-left hover:shadow-md transition"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-600">{s.description}</p>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg shadow min-h-[500px] flex flex-col">
            {/* 场景提示 */}
            <div className="p-4 bg-purple-50 border-b">
              <span className="text-sm text-purple-700">
                当前场景：{SCENARIOS.find(s => s.id === selectedScenario)?.title}
              </span>
            </div>

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
                    <div className="text-xs opacity-70 mb-1">
                      {msg.role === 'user' ? '你（销售）' : '客户'}
                    </div>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-600 p-3 rounded-lg">
                    客户思考中...
                  </div>
                </div>
              )}
            </div>

            {/* 输入框 */}
            <form onSubmit={handleSend} className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="输入你的回复..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  发送
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}
