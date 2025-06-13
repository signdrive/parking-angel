"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { MessageCircle, X, Send, Mic, MicOff, Bot, User, Minimize2, Maximize2 } from "lucide-react"
import { useAIAssistant } from "./ai-assistant-context"

interface ChatMessage {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
}

export function FloatingAIChat() {
  const { open, pendingMessage, setPendingMessage } = useAIAssistant()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      type: "ai",
      content:
        "Hi! I'm your parking assistant. I can help you find spots, navigate, and answer questions about parking in your area.",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (pendingMessage) {
      console.log("Received pending message:", pendingMessage)
      setIsOpen(true) // Ensure chat opens when message is received
      
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        type: "user",
        content: pendingMessage,
        timestamp: new Date(),
      }

      setMessages((msgs) => [...msgs, userMessage])
      setPendingMessage(null)
      
      // Auto-generate AI response
      setTimeout(() => {
        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: "ai",
          content: generateAIResponse(pendingMessage),
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, aiResponse])
      }, 1000)
    }
  }, [pendingMessage, setPendingMessage])

  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: content.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      // Simulate AI response
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: generateAIResponse(content),
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiResponse])
    } catch (error) {
      console.error("Failed to get AI response:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase()

    if (input.includes("navigate") || input.includes("directions")) {
      return 'I can help you navigate to any parking spot! Just click on a spot on the map and select "Navigate" to get turn-by-turn directions with voice guidance.'
    }

    if (input.includes("price") || input.includes("cost") || input.includes("cheap")) {
      return "I found several affordable options nearby. The cheapest spots are typically street parking (free) and some lots under $5/hour. Would you like me to show you the most cost-effective routes?"
    }

    if (input.includes("available") || input.includes("free") || input.includes("open")) {
      return "Based on real-time data, I see several available spots within 2 blocks. The green markers on the map show live availability. Shall I guide you to the nearest one?"
    }

    if (input.includes("traffic") || input.includes("busy")) {
      return "Current traffic conditions are moderate. I recommend leaving 5-10 extra minutes for your journey. I can calculate the optimal route avoiding heavy traffic areas."
    }

    if (input.includes("reserve") || input.includes("book")) {
      return 'You can reserve spots at participating locations. Look for the "Reserve" button on premium spots. This guarantees your space and often includes discounted rates.'
    }

    return "I understand you're looking for parking assistance. I can help with finding spots, navigation, pricing info, and real-time availability. What specific help do you need?"
  }

  const toggleVoiceInput = () => {
    if (!isListening) {
      // Start voice recognition
      if ("webkitSpeechRecognition" in window) {
        const recognition = new (window as any).webkitSpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = "en-US"

        recognition.onstart = () => {
          setIsListening(true)
        }

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          setInputValue(transcript)
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
    } else {
      setIsListening(false)
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-24 rounded-full w-14 h-14 shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 z-50"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
    )
  }

  return (
    <Card
      className={cn(
        "fixed bottom-6 left-24 z-50 shadow-xl border-2 border-purple-200 transition-all duration-300",
        isMinimized ? "w-80 h-16" : "w-96 h-[500px]",
      )}
    >
      <CardHeader className="pb-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bot className="w-5 h-5" />
            {!isMinimized && "AI Parking Assistant"}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:bg-white/20 h-8 w-8"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        {!isMinimized && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm opacity-90">Online & Ready</span>
          </div>
        )}
      </CardHeader>

      {!isMinimized && (
        <>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 max-h-80">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn("flex gap-2", message.type === "user" ? "justify-end" : "justify-start")}
              >
                {message.type === "ai" && (
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}

                <div
                  className={cn(
                    "max-w-[80%] p-3 rounded-lg text-sm",
                    message.type === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-gray-100 text-gray-900 rounded-bl-none",
                  )}
                >
                  {message.content}
                  <div
                    className={cn(
                      "text-xs mt-1 opacity-70",
                      message.type === "user" ? "text-blue-100" : "text-gray-500",
                    )}
                  >
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>

                {message.type === "user" && (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 justify-start">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-100 p-3 rounded-lg rounded-bl-none">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about parking, navigation, or prices..."
                onKeyPress={(e) => e.key === "Enter" && sendMessage(inputValue)}
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={toggleVoiceInput}
                className={cn("transition-colors", isListening ? "bg-red-100 border-red-300" : "hover:bg-gray-100")}
              >
                {isListening ? <MicOff className="w-4 h-4 text-red-600" /> : <Mic className="w-4 h-4" />}
              </Button>
              <Button
                onClick={() => sendMessage(inputValue)}
                disabled={!inputValue.trim() || isLoading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex gap-1 mt-2">
              <Badge
                variant="outline"
                className="text-xs cursor-pointer hover:bg-gray-100"
                onClick={() => sendMessage("Find nearest parking")}
              >
                Find nearest
              </Badge>
              <Badge
                variant="outline"
                className="text-xs cursor-pointer hover:bg-gray-100"
                onClick={() => sendMessage("Show cheapest options")}
              >
                Cheapest
              </Badge>
              <Badge
                variant="outline"
                className="text-xs cursor-pointer hover:bg-gray-100"
                onClick={() => sendMessage("Navigate to spot")}
              >
                Navigate
              </Badge>
            </div>
          </div>
        </>
      )}
    </Card>
  )
}
