import { createBrowserClient } from '@supabase/ssr'
import { Database as SchemaType } from './types/supabase'

export type Database = SchemaType;

export function isSupabaseConfigured() {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      get(name: string) {
        if (typeof document === 'undefined') return ''
        const cookie = document.cookie
          .split('; ')
          .find((row) => row.startsWith(`${name}=`))
        return cookie ? cookie.split('=')[1] : ''
      },
      set(name: string, value: string, options: { path?: string; maxAge?: number; domain?: string; secure?: boolean }) {
        if (typeof document === 'undefined') return
        document.cookie = `${name}=${value}; path=${options.path || '/'}; max-age=${options.maxAge || 31536000}${options.domain ? `; domain=${options.domain}` : ''}${options.secure ? '; secure' : ''}`
      },
      remove(name: string, options?: { path?: string; domain?: string }) {
        if (typeof document === 'undefined') return
        document.cookie = `${name}=; path=${options?.path || '/'}${options?.domain ? `; domain=${options.domain}` : ''}; max-age=0`
      }
    }
  }
)
