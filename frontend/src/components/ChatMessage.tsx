import ReactMarkdown from 'react-markdown'
import { format } from 'date-fns'
import type { ChatMessage as Message } from '../types'
import { cn } from '../lib/utils'

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div className={cn('flex w-full', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-3xl rounded-2xl border px-4 py-3 shadow-glow',
          isUser
            ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-50'
            : 'border-cyber-border bg-cyber-card text-cyber-text-primary',
        )}
      >
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-cyber-text-secondary">
          {isUser ? 'Analyst' : 'Mythos AI'} · {format(new Date(message.createdAt), 'HH:mm')}
        </p>
        {isUser ? (
          <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none text-sm leading-6 prose-p:my-2 prose-code:text-cyan-300">
            <ReactMarkdown>{message.content || '…'}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
}
