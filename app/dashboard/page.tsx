import { auth } from "@/auth"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Shell } from "@/components/shell"
import { UserAvatar } from "@/components/user-avatar"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import { Shield } from "lucide-react"

async function getDashboardData() {
  // Mimic fetching data from a database
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return {
    servers: 12,
    storage: "850 GB",
    upgrades: 2,
  }
}

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/sign-in?callbackUrl=/dashboard")
  }

  const user = session.user

  // Add this near the top of the component after the user loading check
  const adminEmails = [
    "admin@parkalgo.com",
    "admin@parkingangel.com",
    "your-email@example.com", // Replace with your actual email
  ]
  const isAdmin = user?.user_metadata?.role === "admin" || adminEmails.includes(user?.email || "")

  const data = await getDashboardData()

  return (
    <Shell>
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold leading-tight tracking-tighter">Dashboard</h1>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <UserAvatar name={user.name || null} email={user.email || null} image={user.image || null} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account">Account</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/sign-out">Sign out</Link>
                </DropdownMenuItem>
                {/* Add this admin link near other navigation buttons */}
                {isAdmin && (
                  <Button asChild variant="outline">
                    <Link href="/admin/dashboard">
                      <Shield className="w-4 h-4 mr-2" />
                      Admin Panel
                    </Link>
                  </Button>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <Separator />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">{data.servers}</h2>
            <p className="text-muted-foreground">Servers</p>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">{data.storage}</h2>
            <p className="text-muted-foreground">Storage</p>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">{data.upgrades}</h2>
            <p className="text-muted-foreground">Upgrades</p>
          </div>
        </div>
      </div>
    </Shell>
  )
}
