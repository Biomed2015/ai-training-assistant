const MINIMAX_API_URL = 'https://api.minimax.chat/v1/text/chatcompletion_v2'

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export async function chatWithAI(messages: ChatMessage[]): Promise<string> {
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
    throw new Error(`Minimax API error: ${response.status}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || '抱歉，我无法回答这个问题。'
}
