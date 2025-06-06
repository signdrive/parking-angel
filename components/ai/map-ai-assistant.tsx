"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Brain, X, Mic, Send, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface MapAIAssistantProps {
  className?: string
}

export function MapAIAssistant({ className }: MapAIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    {
      role: "assistant",
      content: "Hi! I'm your parking AI assistant. How can I help you find parking today?",
    },
  ])

  const handleSend = () => {
    if (!message.trim()) return

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: message }])

    // Simulate AI thinking
    setTimeout(() => {
      let response = ""

      if (message.toLowerCase().includes("parking near")) {
        response =
          "I found several parking options nearby! The closest is Central Garage (0.2 miles) with 15 available spots. Would you like me to navigate you there?"
      } else if (message.toLowerCase().includes("cheap") || message.toLowerCase().includes("price")) {
        response =
          "The most affordable parking nearby is Street Parking at $2/hour. Premium options with security start at $5/hour. Which would you prefer?"
      } else if (message.toLowerCase().includes("time") || message.toLowerCase().includes("when")) {
        response =
          "Based on current traffic and your location, I recommend leaving in 15 minutes to arrive on time. There's 85% probability of finding parking within 5 minutes of arrival."
      } else {
        response =
          "I can help you find parking, check prices, estimate availability, or optimize your route. What would you like to know?"
      }

      setMessages((prev) => [...prev, { role: "assistant", content: response }])
    }, 1000)

    setMessage("")
  }

  const handleVoice = () => {
    setIsListening(true)

    // Simulate voice recognition
    setTimeout(() => {
      setMessage("Find parking near my destination")
      setIsListening(false)
    }, 2000)
  }

  const toggleOpen = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className={cn("fixed bottom-24 right-6 z-10", className)}>
      {!isOpen ? (
        <Button onClick={toggleOpen} className="h-14 w-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700">
          <Brain className="h-6 w-6 text-white" />
        </Button>
      ) : (
        <Card className="w-80 shadow-lg border-blue-200">
          <div className="bg-blue-600 text-white p-3 flex items-center justify-between rounded-t-lg">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              <h3 className="font-medium">Parking AI Assistant</h3>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-blue-700" onClick={toggleOpen}>
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-white hover:bg-blue-700"
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
                    "mb-3 max-w-[85%] rounded-lg p-3",
                    msg.role === "user" ? "bg-blue-600 text-white ml-auto" : "bg-white border text-gray-700",
                  )}
                >
                  {msg.content}
                </div>
              ))}
            </div>
            <div className="p-3 border-t flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className={cn("rounded-full", isListening ? "text-red-500 bg-red-50" : "text-gray-500")}
                onClick={handleVoice}
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
              />
              <Button variant="ghost" size="icon" className="rounded-full text-blue-600" onClick={handleSend}>
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
