"use client"

import { Profile } from "@/lib/types/supabase-helpers"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

interface AdminUsersListProps {
  users: Profile[]
}

const getBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'active':
      return 'default';
    case 'trialing':
      return 'secondary';
    case 'past_due':
      return 'destructive';
    default:
      return 'outline';
  }
}

export function AdminUsersList({ users }: AdminUsersListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Subscription</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Joined</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map(user => (
          <TableRow key={user.id}>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.full_name || `${user.first_name || ''} ${user.last_name || ''}`}</TableCell>
            <TableCell>
              <Badge variant={user.role === 'admin' ? 'destructive' : 'default'}>
                {user.role || 'user'}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={user.subscription_tier === 'premium' ? 'secondary' : 'outline'}>
                {user.subscription_tier || 'free'}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={getBadgeVariant(user.subscription_status || 'inactive')}>
                {user.subscription_status || 'No subscription'}
              </Badge>
            </TableCell>
            <TableCell>
              {user.created_at ? formatDistanceToNow(new Date(user.created_at), { addSuffix: true }) : 'N/A'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
