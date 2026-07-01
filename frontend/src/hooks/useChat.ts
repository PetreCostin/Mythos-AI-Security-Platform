import { useCallback, useState } from 'react'
import type { ChatMessage } from '../types'

const mockResponse =
  'I could not reach the live Mythos AI backend, so this is a fallback analyst summary. Based on the submitted prompt, prioritize containment, preserve forensic artifacts, and correlate with recent identity and endpoint alerts before eradicating the threat.'

function parseStreamChunk(chunk: string): string {
  return chunk
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      if (line.startsWith('data:')) {
        const payload = line.replace(/^data:\s*/, '')
        if (payload === '[DONE]') {
          return ''
        }
        try {
          const parsed = JSON.parse(payload) as { content?: string; token?: string; message?: string }
          return parsed.content ?? parsed.token ?? parsed.message ?? ''
        } catch {
          return payload
        }
      }
      try {
        const parsed = JSON.parse(line) as { content?: string; token?: string; message?: string }
        return parsed.content ?? parsed.token ?? parsed.message ?? ''
      } catch {
        return line
      }
    })
    .join('')
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    }

    const assistantId = crypto.randomUUID()
    const history = [...messages, userMessage].map(({ role, content: messageContent }) => ({
      role,
      content: messageContent,
    }))

    setMessages((current) => [
      ...current,
      userMessage,
      { id: assistantId, role: 'assistant', content: '', createdAt: new Date().toISOString() },
    ])
    setIsTyping(true)
    setError(null)

    try {
      const response = await fetch('http://localhost:8001/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: content, history, stream: true }),
      })

      if (!response.ok) {
        throw new Error('Chat request failed')
      }

      if (!response.body) {
        const data = (await response.json()) as { message?: string }
        const fallback = data.message ?? 'No response received from AI service.'
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantId ? { ...message, content: fallback } : message,
          ),
        )
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let aggregated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          break
        }

        aggregated += parseStreamChunk(decoder.decode(value, { stream: true }))
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantId ? { ...message, content: aggregated } : message,
          ),
        )
      }
    } catch {
      let aggregated = ''
      for (const token of mockResponse.split(' ')) {
        aggregated = `${aggregated}${token} `
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantId ? { ...message, content: aggregated.trimEnd() } : message,
          ),
        )
        await new Promise((resolve) => window.setTimeout(resolve, 35))
      }
      setError('Live AI service unavailable. Displaying fallback response.')
    } finally {
      setIsTyping(false)
    }
  }, [messages])

  return {
    messages,
    isTyping,
    error,
    sendMessage,
  }
}
