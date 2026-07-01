import { useState } from 'react'
import { Bot, Send } from 'lucide-react'
import { ChatMessage } from '../components/ChatMessage'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { useChat } from '../hooks/useChat'

export default function AIChatPage() {
  const [draft, setDraft] = useState('')
  const { messages, isTyping, error, sendMessage } = useChat()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = draft.trim()
    if (!trimmed) {
      return
    }

    setDraft('')
    await sendMessage(trimmed)
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
      <aside className="rounded-2xl border border-cyber-border bg-cyber-card p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-400">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-cyber-text-primary">AI Security Chat</h2>
            <p className="text-sm text-cyber-text-secondary">Threat triage, remediation, intel summaries</p>
          </div>
        </div>
        <div className="mt-6 space-y-3 text-sm text-cyber-text-secondary">
          <p>Try prompts like:</p>
          <ul className="space-y-2 rounded-2xl border border-cyber-border bg-cyber-background p-4">
            <li>• Summarize the latest credential dumping indicators.</li>
            <li>• Explain the blast radius of CVE-2026-1881.</li>
            <li>• Suggest containment steps for suspected phishing compromise.</li>
          </ul>
        </div>
      </aside>

      <section className="flex min-h-[70vh] flex-col rounded-2xl border border-cyber-border bg-cyber-card">
        <div className="border-b border-cyber-border px-5 py-4">
          <h2 className="text-lg font-semibold text-cyber-text-primary">Analyst conversation</h2>
          <p className="text-sm text-cyber-text-secondary">POSTs to /ai/chat and streams incremental output when available.</p>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {messages.length === 0 ? (
            <div className="flex h-full min-h-[45vh] flex-col items-center justify-center rounded-2xl border border-dashed border-cyber-border bg-cyber-background/60 px-6 text-center">
              <Bot className="h-10 w-10 text-cyan-400" />
              <p className="mt-4 text-lg font-medium text-cyber-text-primary">Start an investigation</p>
              <p className="mt-2 max-w-xl text-sm text-cyber-text-secondary">
                Ask Mythos AI to summarize incidents, analyze indicators, or recommend response steps.
              </p>
            </div>
          ) : (
            messages.map((message) => <ChatMessage key={message.id} message={message} />)
          )}
          {isTyping ? <LoadingSpinner label="Mythos AI is typing" className="justify-start" /> : null}
        </div>

        <form onSubmit={handleSubmit} className="border-t border-cyber-border px-5 py-4">
          {error ? (
            <div className="mb-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
              {error}
            </div>
          ) : null}
          <div className="flex flex-col gap-3 md:flex-row">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={3}
              placeholder="Ask Mythos AI about incidents, CVEs, detections, or response actions..."
              className="min-h-[90px] flex-1 rounded-2xl border border-cyber-border bg-cyber-background px-4 py-3 text-sm text-cyber-text-primary placeholder:text-cyber-text-secondary focus:border-cyan-500 focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 font-medium text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isTyping}
            >
              <Send className="h-4 w-4" />
              Send
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
