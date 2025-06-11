import type React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { User } from "@supabase/supabase-js"
import { cn } from "@/lib/utils"

interface UserAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  user: Pick<User, "id" | "user_metadata"> | null
  size?: "sm" | "md" | "lg"
}

export function UserAvatar({ user, size = "md", className, ...props }: UserAvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-14 w-14",
  }

  return (
    <Avatar className={cn(sizeClasses[size], className)} {...props}>
      {user?.user_metadata?.avatar_url ? (
        <AvatarImage
          src={user.user_metadata.avatar_url || "/placeholder.svg"}
          alt={user.user_metadata.full_name || user.user_metadata.name || "User"}
          referrerPolicy="no-referrer"
        />
      ) : null}
      <AvatarFallback>
        {user?.user_metadata?.full_name
          ? `${user.user_metadata.full_name.charAt(0)}`
          : user?.user_metadata?.name
            ? `${user.user_metadata.name.charAt(0)}`
            : "U"}
      </AvatarFallback>
    </Avatar>
  )
}
