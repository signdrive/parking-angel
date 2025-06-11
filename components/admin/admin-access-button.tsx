"use client"

import { Button } from "@/components/ui/button"
import { Shield } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"

export function AdminAccessButton() {
  const { user } = useAuth()

  // Admin emails - these work even without email confirmation
  const adminEmails = [
    "admin@parkalgo.com",
    "admin@parkingangel.com",
    "your-email@example.com", // Replace with your actual email
  ]

  // Check if user is admin
  const isAdmin = user?.user_metadata?.role === "admin" || adminEmails.includes(user?.email || "")

  if (!isAdmin) return null

  return (
    <Button asChild variant="outline" size="sm" className="border-red-200 text-red-700 hover:bg-red-50">
      <Link href="/admin">
        <Shield className="w-4 h-4 mr-2" />
        Admin
      </Link>
    </Button>
  )
}
