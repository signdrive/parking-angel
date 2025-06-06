"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Brain, X, Mic, Send, ChevronDown, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface MapAIAssistantProps {
  className?: string
}

export function MapAIAssistant({ className }: MapAIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    {
      role: "assistant",
      content: "Hi! I'm your Grok-powered parking AI assistant. How can I help you find parking today?",
    },
  ])

  const handleSend = async () => {
    if (!message.trim() || isLoading) return

    const userMessage = message.trim()
    setMessage("")
    setIsLoading(true)

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])

    try {
      // Call Grok AI API
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
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }])
    } catch (error) {
      console.error("Error calling Grok AI:", error)

      // Fallback response
      let fallbackResponse = ""
      if (userMessage.toLowerCase().includes("parking near")) {
        fallbackResponse =
          "I found several parking options nearby! The closest is Central Garage (0.2 miles) with 15 available spots. Would you like me to navigate you there?"
      } else if (userMessage.toLowerCase().includes("cheap") || userMessage.toLowerCase().includes("price")) {
        fallbackResponse =
          "The most affordable parking nearby is Street Parking at $2/hour. Premium options with security start at $5/hour. Which would you prefer?"
      } else if (userMessage.toLowerCase().includes("time") || userMessage.toLowerCase().includes("when")) {
        fallbackResponse =
          "Based on current traffic and your location, I recommend leaving in 15 minutes to arrive on time. There's 85% probability of finding parking within 5 minutes of arrival."
      } else {
        fallbackResponse =
          "I can help you find parking, check prices, estimate availability, or optimize your route. What would you like to know?"
      }

      setMessages((prev) => [...prev, { role: "assistant", content: fallbackResponse }])
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
              <h3 className="font-medium">Grok AI Assistant</h3>
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
                  {msg.content}
                </div>
              ))}
              {isLoading && (
                <div className="mb-3 max-w-[85%] rounded-lg p-3 bg-white border text-gray-700 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Grok is thinking...</span>
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
                placeholder="Ask Grok about parking..."
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
