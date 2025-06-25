/**
 * For backwards compatibility, re-export the browser client as the default client
 * and the server client for server-side operations.
 */

export { getBrowserClient as supabase } from './supabase/browser'
export { createClient as createServerClient } from './supabase/server' // Updated export
export type { Database } from './types/supabase'
