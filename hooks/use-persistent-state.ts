"use client"

import { useState, useEffect } from "react"

export function usePersistentState<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  // Initialize state with default value first
  const [state, setState] = useState<T>(defaultValue)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load from localStorage after component mounts (client-side only)
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item !== null) {
        const parsedValue = JSON.parse(item)
        setState(parsedValue)
      }
    } catch (error) {

    } finally {
      setIsInitialized(true)
    }
  }, [key])

  // Update localStorage when state changes (but not on initial load)
  const setPersistentState = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(state) : value
      setState(valueToStore)

      // Only save to localStorage if we're initialized and on client-side
      if (isInitialized && typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {

    }
  }

  return [state, setPersistentState]
}
