import { PostgrestError } from '@supabase/supabase-js'

export function handleSupabaseError(error: PostgrestError) {
  switch (error.code) {
    case '23505':
      return 'Duplicate entry.'
    case '23503':
      return 'Foreign key violation.'
    case '23502':
      return 'Missing required field.'
    case '42501':
      return 'Insufficient privileges.'
    case '28P01':
      return 'Authentication failed.'
    case '40001':
      return 'Serialization failure.'
    case '42P01':
      return 'Table does not exist.'
    default:
      return error.message || 'Unknown database error.'
  }
}
