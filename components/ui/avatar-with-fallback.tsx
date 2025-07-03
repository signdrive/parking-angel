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
}
