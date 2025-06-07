"use client"

import type React from "react"

import { Provider } from "react-redux"
import { navigationStore } from "@/lib/navigation-redux-store"

interface NavigationProviderProps {
  children: React.ReactNode
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  return <Provider store={navigationStore}>{children}</Provider>
}
