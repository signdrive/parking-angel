"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Sparkles, X, Send, Mic, Minimize2, Maximize2, Loader2, Brain } from "lucide-react"
import { cn } from "@/lib/utils"

interface FloatingAIChatProps {
  className?: string
}

export function FloatingAIChat({ className }: FloatingAIChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: "assistant" as const,
      content: "Hi! I'm your AI parking assistant. How can I help you find the perfect parking spot today?",
      timestamp: new Date(),
    },
  ])

  const handleSend = async () => {
    if (!message.trim() || isLoading) return

    const userMessage = message.trim()
    setMessage("")
    setIsLoading(true)

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        role: "user" as const,
        content: userMessage,
        timestamp: new Date(),
      },
    ])

    try {
      const response = await fetch("/api/ai/grok-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          context: "floating_chat",
        }),
      })

      const data = await response.json()

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant" as const,
          content: data.response || "I'm having trouble right now. Please try again.",
          timestamp: new Date(),
        },
      ])
    } catch (error) {
      console.error("Error calling AI:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant" as const,
          content: "Sorry, I'm having trouble connecting. Please try again in a moment.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50",
          "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700",
          "animate-pulse hover:animate-none transition-all duration-300",
          className,
        )}
      >
        <Sparkles className="h-6 w-6 text-white" />
      </Button>
    )
  }

  return (
    <Card
      className={cn(
        "fixed bottom-6 right-6 z-50 shadow-2xl border-purple-200",
        isMinimized ? "w-80 h-16" : "w-96 h-[500px]",
        "transition-all duration-300 ease-in-out",
        className,
      )}
    >
      {/* Header */}
      <CardHeader className="pb-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Assistant
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="p-0 flex flex-col h-[calc(500px-80px)]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg p-3 text-sm",
                    msg.role === "user"
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                      : "bg-white border shadow-sm text-gray-800",
                  )}
                >
                  <div className="whitespace-pre-line">{msg.content}</div>
                  <div
                    className={cn("text-xs mt-1 opacity-70", msg.role === "user" ? "text-purple-100" : "text-gray-500")}
                  >
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border shadow-sm rounded-lg p-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                    <span className="text-gray-600">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-white">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-gray-500 hover:text-purple-600" disabled={isLoading}>
                <Mic className="w-4 h-4" />
              </Button>
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about parking..."
                className="flex-1 border-gray-200 focus:border-purple-500"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={isLoading || !message.trim()}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
