'use client';

import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './avatar'
import { cn } from '../../lib/utils'

interface AvatarWithFallbackProps {
  src?: string | null
  fallbackText?: string
  alt?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  onError?: (error: unknown) => void
}

export function AvatarWithFallback({ 
  src, 
  fallbackText = "U", 
  alt = "User avatar",
  className,
  size = 'md',
  onError
}: AvatarWithFallbackProps) {
  const [error, setError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [retryCount, setRetryCount] = useState(0)
  const [currentSrc, setCurrentSrc] = useState(src)

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  }

  useEffect(() => {
    if (src !== currentSrc) {
      setError(false)
      setIsLoading(true)
      setRetryCount(0)
      setCurrentSrc(src)
    }
  }, [src])

  const handleError = async (e: unknown) => {
    setError(true)
    setIsLoading(false)
    if (onError) onError(e)

    // If it's a Google profile image that failed
    if (currentSrc?.includes('googleusercontent.com') && retryCount < 2) {
      setRetryCount(prev => prev + 1)
      
      // First try: remove any size parameters
      if (retryCount === 0) {
        const baseUrl = currentSrc.split('=')[0]
        setCurrentSrc(`${baseUrl}=s96-c`)
        return
      }
      
      // Second try: use placeholder
      if (retryCount === 1) {
        setCurrentSrc('/placeholder-avatar.png')
        return
      }
    }
  }

  const handleLoad = () => {
    setIsLoading(false)
    setError(false)
  }

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {currentSrc && !error && (
        <AvatarImage 
          src={currentSrc} 
          alt={alt}
          onError={handleError}
          onLoadingStatusChange={(status) => {
            if (status === 'loaded') handleLoad()
          }}
        />
      )}
      <AvatarFallback delayMs={isLoading ? 1000 : 0}>
        {fallbackText?.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  )
}