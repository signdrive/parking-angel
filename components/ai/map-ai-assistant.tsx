"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Brain, X, Mic, Send, ChevronDown, Loader2, Wifi, WifiOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface MapAIAssistantProps {
  className?: string
}

export function MapAIAssistant({ className }: MapAIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"unknown" | "connected" | "fallback">("unknown")
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string; fallback?: boolean }[]>([
    {
      role: "assistant",
      content: "Hi! I'm your Grok-powered parking AI assistant. How can I help you find parking today?",
    },
  ])

  // Test connection on mount
  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      const response = await fetch("/api/ai/grok-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "test connection",
          context: "connection_test",
        }),
      })

      const data = await response.json()
      setConnectionStatus(data.fallback ? "fallback" : "connected")
    } catch (error) {
      setConnectionStatus("fallback")
    }
  }

  const handleSend = async () => {
    if (!message.trim() || isLoading) return

    const userMessage = message.trim()
    setMessage("")
    setIsLoading(true)

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])

    try {
      const response = await fetch("/api/ai/grok-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          context: "parking_assistant",
          location: "current_map_view",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get AI response")
      }

      const data = await response.json()

      // Add AI response
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
          fallback: data.fallback,
        },
      ])

      // Update connection status
      setConnectionStatus(data.fallback ? "fallback" : "connected")
    } catch (error) {
      console.error("Error calling AI:", error)

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I'm having trouble right now. Please try again in a moment.",
          fallback: true,
        },
      ])
      setConnectionStatus("fallback")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVoice = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Speech recognition not supported in this browser")
      return
    }

    setIsListening(true)

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = "en-US"

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setMessage(transcript)
      setIsListening(false)
    }

    recognition.onerror = () => {
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  const toggleOpen = () => {
    setIsOpen(!isOpen)
  }

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case "connected":
        return <Wifi className="h-4 w-4 text-green-500" />
      case "fallback":
        return <WifiOff className="h-4 w-4 text-orange-500" />
      default:
        return <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
    }
  }

  const getStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return "Grok AI Connected"
      case "fallback":
        return "Smart Fallback Mode"
      default:
        return "Connecting..."
    }
  }

  return (
    <div className={cn("fixed bottom-24 right-6 z-50", className)}>
      {!isOpen ? (
        <Button
          onClick={toggleOpen}
          className="h-14 w-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 animate-pulse"
        >
          <Brain className="h-6 w-6 text-white" />
        </Button>
      ) : (
        <Card className="w-80 shadow-xl border-blue-200 bg-white">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 flex items-center justify-between rounded-t-lg">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              <div>
                <h3 className="font-medium">Parking AI</h3>
                <div className="flex items-center gap-1 text-xs opacity-90">
                  {getStatusIcon()}
                  <span>{getStatusText()}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/20" onClick={toggleOpen}>
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-white hover:bg-white/20"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardContent className="p-0">
            <div className="h-64 overflow-y-auto p-3 bg-gray-50">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "mb-3 max-w-[85%] rounded-lg p-3 text-sm",
                    msg.role === "user" ? "bg-blue-600 text-white ml-auto" : "bg-white border text-gray-700 shadow-sm",
                  )}
                >
                  <div className="whitespace-pre-line">{msg.content}</div>
                  {msg.fallback && (
                    <div className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                      <WifiOff className="h-3 w-3" />
                      Smart fallback response
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="mb-3 max-w-[85%] rounded-lg p-3 bg-white border text-gray-700 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>AI is thinking...</span>
                  </div>
                </div>
              )}
            </div>
            <div className="p-3 border-t flex items-center gap-2 bg-white">
              <Button
                variant="ghost"
                size="icon"
                className={cn("rounded-full", isListening ? "text-red-500 bg-red-50 animate-pulse" : "text-gray-500")}
                onClick={handleVoice}
                disabled={isLoading}
              >
                <Mic className="h-5 w-5" />
              </Button>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about parking..."
                className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-blue-600 hover:bg-blue-50"
                onClick={handleSend}
                disabled={isLoading || !message.trim()}
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
