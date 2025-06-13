"use client"

import React, { createContext, useContext, useState, useCallback } from "react"

interface AIAssistantContextType {
  open: boolean
  openAI: () => void
  sendMessage: (msg: string) => void
  pendingMessage: string | null
  setPendingMessage: (msg: string | null) => void
}

const AIAssistantContext = createContext<AIAssistantContextType | undefined>(undefined)

export function useAIAssistant() {
  const ctx = useContext(AIAssistantContext)
  if (!ctx) throw new Error("useAIAssistant must be used within AIAssistantProvider")
  return ctx
}

export function AIAssistantProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [pendingMessage, setPendingMessage] = useState<string | null>(null)

  const openAI = useCallback(() => setOpen(true), [])
  const sendMessage = useCallback((msg: string) => {
    setOpen(true)
    setPendingMessage(msg)
  }, [])

  const contextValue: AIAssistantContextType = {
    open,
    openAI,
    sendMessage,
    pendingMessage,
    setPendingMessage,
  }

  return (
    <AIAssistantContext.Provider value={contextValue}>
      {children}
    </AIAssistantContext.Provider>
  )
}
