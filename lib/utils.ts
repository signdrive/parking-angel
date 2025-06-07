import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Add the new utility functions here
export function formatDistance(meters: number): string {
  if (meters < 0) meters = 0 // Handle potential negative values gracefully
  if (meters < 1000) {
    return `${Math.round(meters)}m`
  } else {
    return `${(meters / 1000).toFixed(1)}km`
  }
}

export function formatDuration(seconds: number): string {
  if (seconds < 0) seconds = 0 // Handle potential negative values gracefully

  const totalMinutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.round(seconds % 60) // Keep seconds for more precision if needed, or remove

  if (totalMinutes < 1) {
    return `${remainingSeconds}s`
  }

  if (totalMinutes < 60) {
    return `${totalMinutes} min`
  } else {
    const hours = Math.floor(totalMinutes / 60)
    const remainingMinutes = totalMinutes % 60
    if (remainingMinutes === 0) {
      return `${hours}h`
    }
    return `${hours}h ${remainingMinutes}m`
  }
}
