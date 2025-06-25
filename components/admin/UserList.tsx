'use client';

import { useState } from 'react';
import type { Database } from '@/lib/types/supabase';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  Search, 
  UserCheck, 
  UserX,
  Star,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type User = {
  id: string;
  email: string;
  role: UserRole;
  created_at: string | null;
  profiles?: {
    subscription_tier: SubscriptionTier | null;
    subscription_status: SubscriptionStatus | null;
  } | null;
};

export type UserRole = 'user' | 'admin' | 'moderator' | 'suspended';
export type SubscriptionTier = 'free' | 'premium' | 'business';
export type SubscriptionStatus = 'active' | 'inactive' | 'trial' | 'past_due' | 'cancelled';

const USER_ROLE = {
  USER: 'user' as const,
  ADMIN: 'admin' as const,
  MODERATOR: 'moderator' as const,
  SUSPENDED: 'suspended' as const
};

const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active' as const,
  INACTIVE: 'inactive' as const,
  TRIAL: 'trial' as const,
  PAST_DUE: 'past_due' as const,
  CANCELLED: 'cancelled' as const
};

interface UserListProps {
  users: User[];
  onSuspendUser?: (userId: string) => Promise<void>;
  onUnsuspendUser?: (userId: string) => Promise<void>;
}

const getRoleBadgeVariant = (role: UserRole) => {
  switch (role) {
    case USER_ROLE.ADMIN:
      return 'default';
    case USER_ROLE.SUSPENDED:
      return 'destructive';
    case USER_ROLE.MODERATOR:
      return 'secondary';
    default:
      return 'outline';
  }
};

const getSubscriptionBadgeVariant = (status: SubscriptionStatus | null) => {
  switch (status) {
    case SUBSCRIPTION_STATUS.ACTIVE:
      return 'default';
    case SUBSCRIPTION_STATUS.TRIAL:
      return 'secondary';
    case SUBSCRIPTION_STATUS.PAST_DUE:
    case SUBSCRIPTION_STATUS.CANCELLED:
      return 'destructive';
    default:
      return 'outline';
  }
};

export default function UserList({ users, onSuspendUser, onUnsuspendUser }: UserListProps) {
  const [sortField, setSortField] = useState<keyof Pick<User, 'email' | 'created_at' | 'role'>>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const filteredUsers = users.filter(user => {
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesSearch = !searchTerm || user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    const direction = sortDirection === 'asc' ? 1 : -1;
    
    if (!aVal && !bVal) return 0;
    if (!aVal) return 1;
    if (!bVal) return -1;
    
    return aVal < bVal ? -direction : direction;
  });

  const toggleSort = (field: keyof Pick<User, 'email' | 'created_at' | 'role'>) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as UserRole | 'all')}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All Roles</SelectItem>
              {Object.values(USER_ROLE).map((role) => (
                <SelectItem key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr className="bg-muted/50">
                <th
                  className="px-4 py-3 text-left text-sm font-medium cursor-pointer"
                  onClick={() => toggleSort('email')}
                >
                  <div className="flex items-center gap-2">
                    User
                    {sortField === 'email' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-medium cursor-pointer"
                  onClick={() => toggleSort('role')}
                >
                  <div className="flex items-center gap-2">
                    Role
                    {sortField === 'role' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">Subscription</th>
                <th
                  className="px-4 py-3 text-left text-sm font-medium cursor-pointer"
                  onClick={() => toggleSort('created_at')}
                >
                  <div className="flex items-center gap-2">
                    Joined
                    {sortField === 'created_at' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        {user.email?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role || USER_ROLE.USER}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={getSubscriptionBadgeVariant(user.profiles?.subscription_status || null)}>
                      {user.profiles?.subscription_tier || 'Free'} - {user.profiles?.subscription_status || 'inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {user.role === USER_ROLE.SUSPENDED ? (
                            <DropdownMenuItem onClick={() => onUnsuspendUser?.(user.id)}>
                              <UserCheck className="mr-2 h-4 w-4" />
                              Unsuspend User
                            </DropdownMenuItem>
                          ) : user.role !== USER_ROLE.ADMIN && (
                            <DropdownMenuItem onClick={() => onSuspendUser?.(user.id)}>
                              <UserX className="mr-2 h-4 w-4" />
                              Suspend User
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
