import { createClient, getDirectServerClient } from './server';
import { Database } from '../types/supabase';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Gets a Supabase client for server-side usage.
 *
 * This should be used in Server Components, Server Actions, and Route Handlers.
 * It correctly handles reading and writing cookies for the current request.
 * Falls back to a direct client during build time when cookies are not available.
 *
 * @returns {Promise<SupabaseClient<Database>>} A promise that resolves to a Supabase client instance.
 */
export const getServerClient = async (): Promise<SupabaseClient<Database>> => {
  try {
    // Try to create a client with cookies (normal request context)
    return createClient();
  } catch (error) {
    // During build time or when cookies are not available, 
    // use the direct client without authentication
    console.warn('Cookies not available, using direct client:', error instanceof Error ? error.message : String(error));
    return getDirectServerClient();
  }
};
