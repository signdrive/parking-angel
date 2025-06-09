"use client"

import type React from "react"

import { useEffect } from "react"
import { patchGlobalFetch } from "@/lib/global-fetch-patch"

export function FetchPatchProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    patchGlobalFetch()
  }, [])

  return <>{children}</>
}
