import { cookies } from 'next/headers';
import { createClient } from './server';
import { Database } from '../types/supabase';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Gets a Supabase client for server-side usage.
 *
 * This should be used in Server Components, Server Actions, and Route Handlers.
 * It correctly handles reading and writing cookies for the current request.
 *
 * @returns {Promise<SupabaseClient<Database>>} A promise that resolves to a Supabase client instance.
 */
export const getServerClient = async (): Promise<SupabaseClient<Database>> => {
  const cookieStore = await cookies();
  return createClient(cookieStore);
};
