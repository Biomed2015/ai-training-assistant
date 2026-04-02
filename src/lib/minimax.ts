import { supabase, Case } from './supabase'

const MINIMAX_API_URL = 'https://api.minimax.chat/v1/text/chatcompletion_v2'

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

// 简单的案例搜索 - 根据关键词匹配
function searchCases(question: string, cases: Case[]): Case[] {
  const keywords = question.toLowerCase().split(/[\s，。、！？,!?]+/)
  const scores: { case: Case; score: number }[] = []

  for (const c of cases) {
    let score = 0
    const titleAndContent = (c.title + ' ' + c.content).toLowerCase()

    for (const keyword of keywords) {
      if (keyword.length < 2) continue
      if (titleAndContent.includes(keyword)) {
        score += 1
      }
    }

    // 匹配行业关键词
    const industryKeywords = ['一区', '二区', '三区', '四区', 'sci', '论文', '期刊', '发表', '润色', '内审', 'meta', '生信', '翻译']
    for (const kw of industryKeywords) {
      if (titleAndContent.includes(kw)) {
        score += 0.5
      }
    }

    if (score > 0) {
      scores.push({ case: c, score })
    }
  }

  scores.sort((a, b) => b.score - a.score)
  return scores.slice(0, 3).map(s => s.case)
}

function formatCasesForContext(cases: Case[]): string {
  if (cases.length === 0) return ''

  let context = '\n\n以下是相关的历史案例供参考：\n\n'

  for (const c of cases) {
    context += `【案例】${c.title}\n`
    if (c.industry) context += `行业：${c.industry}\n`
    if (c.case_type) context += `类型：${c.case_type}\n`
    context += `内容：${c.content.substring(0, 500)}...\n\n`
  }

  return context
}

export async function chatWithAI(
  question: string,
  conversationHistory: ChatMessage[] = []
): Promise<string> {
  // 获取所有案例
  const { data: cases } = await supabase
    .from('cases')
    .select('*')

  // 搜索相关案例
  const relevantCases = cases ? searchCases(question, cases) : []
  const casesContext = formatCasesForContext(relevantCases)

  // 构建系统提示
  const systemPrompt = `你是一个专业的SCI论文发表咨询顾问，基于多年经验帮助用户解答关于SCI论文发表、期刊选择、润色翻译、投稿流程等问题。

你的回答应该：
1. 专业、友好、有耐心
2. 结合用户的具体情况给出建议
3. 参考历史成功案例中的经验和话术
4. 不夸大承诺，如实说明风险

如果涉及具体费用和时间，请参考常见标准：
- 润色翻译：3000-5000元
- 内审服务：四区2万、三区3万、二区4万、一区5万
- 服务周期：润色10-15天，内审1-3个月
${casesContext}`

  // 构建消息
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    { role: 'user', content: question }
  ]

  const response = await fetch(MINIMAX_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.MINIMAX_API_KEY}`
    },
    body: JSON.stringify({
      model: 'MiniMax-Text-01',
      messages: messages.map(m => ({
        role: m.role,
        content: m.content
      })),
      max_tokens: 2048,
      temperature: 0.7
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Minimax API error:', response.status, errorText)
    throw new Error(`AI服务暂时不可用，请稍后重试。错误码: ${response.status}`)
  }

  const data = await response.json()
  const reply = data.choices?.[0]?.message?.content || '抱歉，我暂时无法回答这个问题，请稍后重试。'

  return reply
}
