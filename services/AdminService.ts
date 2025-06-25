import { createAdminClient } from '@/lib/supabase/admin-client'
import { SupabaseClient } from '@supabase/supabase-js'

class AdminService {
  private static instance: AdminService
  private client: SupabaseClient

  private constructor() {
    this.client = createAdminClient()
  }

  public static getInstance(): AdminService {
    if (!AdminService.instance) {
      AdminService.instance = new AdminService()
    }
    return AdminService.instance
  }

  // Add admin methods here
}

export default AdminService
