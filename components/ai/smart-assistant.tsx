"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Brain, Zap, TrendingUp, Send, Mic, MicOff, Sparkles } from "lucide-react"

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
  suggestions?: string[]
  data?: any
}

export function SmartAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "ai",
      content:
        "Hi! I'm your AI parking assistant. I can help you find optimal parking spots, predict availability, and save money. What would you like to know?",
      timestamp: new Date(),
      suggestions: [
        "Find parking near Times Square",
        "When should I leave for my 3 PM meeting?",
        "Show me my parking patterns",
        "What's the cheapest parking downtown?",
      ],
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (message: string = input) => {
    if (!message.trim()) return

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      type: "user",
      content: message,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI processing
    setTimeout(() => {
      const aiResponse = generateAIResponse(message)
      setMessages((prev) => [...prev, aiResponse])
      setIsLoading(false)
    }, 1500)
  }

  const generateAIResponse = (userInput: string): Message => {
    const input = userInput.toLowerCase()

    if (input.includes("find parking") || input.includes("parking near")) {
      return {
        id: `ai_${Date.now()}`,
        type: "ai",
        content:
          "🎯 I found 12 parking spots near your location! Here are the top 3 AI-recommended options based on your preferences:",
        timestamp: new Date(),
        data: {
          spots: [
            { name: "Central Garage", distance: "0.2 mi", price: "$4/hr", availability: "High", aiScore: 95 },
            { name: "Street Parking", distance: "0.1 mi", price: "$3/hr", availability: "Medium", aiScore: 87 },
            { name: "Premium Lot", distance: "0.3 mi", price: "$6/hr", availability: "High", aiScore: 82 },
          ],
        },
        suggestions: ["Book the Central Garage", "Show me walking directions", "Find cheaper alternatives"],
      }
    }

    if (input.includes("when should i leave") || input.includes("departure time")) {
      return {
        id: `ai_${Date.now()}`,
        type: "ai",
        content:
          "⏰ Based on AI analysis of traffic patterns and parking availability, I recommend leaving at 2:15 PM for your 3 PM meeting. This gives you a 92% chance of finding parking within 2 blocks.",
        timestamp: new Date(),
        data: {
          recommendation: {
            departureTime: "2:15 PM",
            confidence: 92,
            reasoning: "Traffic is 15% lighter before 2:30 PM, and parking availability peaks at 2:20 PM in that area.",
          },
        },
        suggestions: ["Set reminder for 2:15 PM", "Show alternative times", "Get traffic updates"],
      }
    }

    if (input.includes("patterns") || input.includes("history") || input.includes("analytics")) {
      return {
        id: `ai_${Date.now()}`,
        type: "ai",
        content:
          "📊 Your AI-powered parking analytics show interesting patterns! You could save $45/month by adjusting your timing by just 10 minutes.",
        timestamp: new Date(),
        data: {
          insights: [
            { type: "savings", value: "$45/month", action: "Arrive 10 min earlier" },
            { type: "efficiency", value: "23% faster", action: "Use recommended routes" },
            { type: "preference", value: "Garage parking", frequency: "78% of the time" },
          ],
        },
        suggestions: ["Show detailed analytics", "Set up smart notifications", "Optimize my routes"],
      }
    }

    if (input.includes("cheapest") || input.includes("save money") || input.includes("budget")) {
      return {
        id: `ai_${Date.now()}`,
        type: "ai",
        content:
          "💰 AI found 8 budget-friendly options! The cheapest is $1.50/hr street parking, but I recommend the $2/hr garage for better security and convenience.",
        timestamp: new Date(),
        data: {
          budgetOptions: [
            { name: "Street Parking", price: "$1.50/hr", pros: ["Cheapest"], cons: ["Less secure", "Time limited"] },
            { name: "Economy Garage", price: "$2/hr", pros: ["Secure", "No time limit"], cons: ["5 min walk"] },
            {
              name: "Early Bird Special",
              price: "$8/day",
              pros: ["All day", "Central"],
              cons: ["Must arrive before 9 AM"],
            },
          ],
        },
        suggestions: ["Book economy garage", "Set early bird reminder", "Find more budget options"],
      }
    }

    // Default AI response
    return {
      id: `ai_${Date.now()}`,
      type: "ai",
      content:
        "🤖 I'm analyzing your request using advanced AI algorithms. I can help you with parking predictions, cost optimization, route planning, and personalized recommendations. What specific parking challenge can I solve for you?",
      timestamp: new Date(),
      suggestions: [
        "Predict parking availability",
        "Optimize my parking costs",
        "Plan my route with parking",
        "Show me parking trends",
      ],
    }
  }

  const startVoiceInput = () => {
    setIsListening(true)
    // Simulate voice recognition
    setTimeout(() => {
      setIsListening(false)
      setInput("Find parking near Central Park")
    }, 2000)
  }

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 px-2 pt-2 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.type === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
              }`}
            >
              <p className="text-sm">{message.content}</p>

              {message.data?.spots && (
                <div className="mt-3 space-y-2">
                  {message.data.spots.map((spot: any, index: number) => (
                    <div key={index} className="bg-white/10 p-2 rounded text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{spot.name}</span>
                        <Badge className="bg-green-500 text-white text-xs">AI Score: {spot.aiScore}</Badge>
                      </div>
                      <div className="flex gap-4 mt-1 text-xs opacity-90">
                        <span>📍 {spot.distance}</span>
                        <span>💰 {spot.price}</span>
                        <span>🟢 {spot.availability}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {message.data?.recommendation && (
                <div className="mt-3 bg-white/10 p-2 rounded text-xs">
                  <div className="font-medium">🎯 AI Recommendation</div>
                  <div className="mt-1">
                    <div>⏰ Depart: {message.data.recommendation.departureTime}</div>
                    <div>🎯 Confidence: {message.data.recommendation.confidence}%</div>
                    <div className="mt-1 text-xs opacity-90">{message.data.recommendation.reasoning}</div>
                  </div>
                </div>
              )}

              {message.data?.insights && (
                <div className="mt-3 space-y-1">
                  {message.data.insights.map((insight: any, index: number) => (
                    <div key={index} className="bg-white/10 p-2 rounded text-xs">
                      <span className="font-medium">{insight.value}</span> - {insight.action}
                    </div>
                  ))}
                </div>
              )}

              {message.suggestions && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {message.suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-xs h-6"
                      onClick={() => handleSendMessage(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              )}

              <div className="text-xs opacity-70 mt-2">{message.timestamp.toLocaleTimeString()}</div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <span className="text-sm text-gray-600 ml-2">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-2 p-2 border-t bg-white">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything about parking..."
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          className="flex-1"
        />
        <Button
          onClick={startVoiceInput}
          variant="outline"
          size="icon"
          className={isListening ? "bg-red-100 border-red-300" : ""}
        >
          {isListening ? <MicOff className="w-4 h-4 text-red-600" /> : <Mic className="w-4 h-4" />}
        </Button>
        <Button onClick={() => handleSendMessage()} disabled={!input.trim() || isLoading}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
