"use client"

import { useState } from "react"

export function usePersistentState<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  // Initialize state with value from localStorage or default
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") {
      return defaultValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return defaultValue
    }
  })

  // Update localStorage when state changes
  const setPersistentState = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(state) : value
      setState(valueToStore)

      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [state, setPersistentState]
}
