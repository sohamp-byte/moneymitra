'use client'

import * as React from 'react'
import { PageHeader } from '@/components/page-header'
import { useMoneyMitraState } from '@/lib/domain/use-store'
import { generateAssistantReply, type AssistantSuggestion } from '@/lib/assistant/responder'
import {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
} from '@/components/ui/message-scroller'
import { Message, MessageContent, MessageHeader } from '@/components/ui/message'
import { Bubble, BubbleContent } from '@/components/ui/bubble'
import { Marker } from '@/components/ui/marker'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupTextarea, InputGroupAddon } from '@/components/ui/input-group'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { SparklesIcon, SendIcon, ShieldCheckIcon } from 'lucide-react'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  suggestions?: AssistantSuggestion[]
}

const STARTER_PROMPTS = [
  'How much can I spend today?',
  "What's my runway?",
  'Which stream pays best?',
  'Show my 30-day forecast',
]

export default function AssistantPage() {
  const state = useMoneyMitraState()
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [input, setInput] = React.useState('')
  const [isThinking, setIsThinking] = React.useState(false)

  function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || isThinking) return
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', text: trimmed }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsThinking(true)
    setTimeout(() => {
      const reply = generateAssistantReply(trimmed, state)
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'assistant', text: reply.text, suggestions: reply.suggestions },
      ])
      setIsThinking(false)
    }, 500)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) {
      e.preventDefault()
      send(input)
    }
  }

  return (
    <div className="flex h-[calc(100vh-1px)] flex-col">
      <PageHeader
        title="Assistant"
        description="Ask about your recorded finances. Answers are grounded only in your data — never speculative."
      />
      <MessageScrollerProvider>
        <div className="flex min-h-0 flex-1 flex-col gap-4 p-4 md:p-6">
          <MessageScroller className="min-h-0 flex-1 rounded-xl border bg-card">
            <MessageScrollerViewport>
              <MessageScrollerContent className="p-4 md:p-6">
                {messages.length === 0 ? (
                  <Empty className="border-none">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <SparklesIcon />
                      </EmptyMedia>
                      <EmptyTitle>Ask me about your money</EmptyTitle>
                      <EmptyDescription>
                        I only answer using events already recorded in your account. Try one of these:
                      </EmptyDescription>
                    </EmptyHeader>
                    <div className="flex flex-wrap justify-center gap-2">
                      {STARTER_PROMPTS.map((p) => (
                        <Button key={p} variant="outline" size="sm" onClick={() => send(p)}>
                          {p}
                        </Button>
                      ))}
                    </div>
                  </Empty>
                ) : (
                  messages.map((m) => (
                    <MessageScrollerItem key={m.id}>
                      <Message align={m.role === 'user' ? 'end' : 'start'}>
                        <MessageContent>
                          {m.role === 'assistant' && (
                            <MessageHeader>
                              <ShieldCheckIcon className="mr-1 size-3.5" data-icon="inline-start" />
                              MoneyMitra Assistant
                            </MessageHeader>
                          )}
                          <Bubble variant={m.role === 'user' ? 'default' : 'secondary'} align={m.role === 'user' ? 'end' : 'start'}>
                            <BubbleContent>{m.text}</BubbleContent>
                          </Bubble>
                          {m.suggestions && m.suggestions.length > 0 && (
                            <div className="flex flex-wrap gap-2 px-3">
                              {m.suggestions.map((s) => (
                                <Button key={s.id} variant="outline" size="sm" onClick={() => send(s.label)}>
                                  {s.label}
                                </Button>
                              ))}
                            </div>
                          )}
                        </MessageContent>
                      </Message>
                    </MessageScrollerItem>
                  ))
                )}
                {isThinking && (
                  <MessageScrollerItem>
                    <Message align="start">
                      <MessageContent>
                        <Marker>Thinking…</Marker>
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                )}
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton />
          </MessageScroller>

          <InputGroup>
            <InputGroupTextarea
              placeholder="Ask about your safe-to-spend, runway, or income streams…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <InputGroupAddon align="inline-end">
              <Button size="icon-sm" onClick={() => send(input)} disabled={!input.trim() || isThinking}>
                <SendIcon />
                <span className="sr-only">Send</span>
              </Button>
            </InputGroupAddon>
          </InputGroup>
        </div>
      </MessageScrollerProvider>
    </div>
  )
}
