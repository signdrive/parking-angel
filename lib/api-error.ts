import { NextResponse } from 'next/server';
import { PostgrestError } from '@supabase/supabase-js';

export class APIError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public errorCode: string = 'unexpected_failure'
  ) {
    super(message);
    this.name = 'APIError';
  }
}

type DatabaseError = {
  code: string | number;
  message?: string;
  details?: string;
};

export function handleAPIError(error: unknown) {
  console.error('API Error:', error);

  if (error instanceof APIError) {
    return NextResponse.json(
      {
        error: error.message,
        error_code: error.errorCode,
        msg: error.message
      },
      { status: error.statusCode }
    );
  }

  // Handle Supabase PostgrestError
  if (error instanceof PostgrestError) {
    return NextResponse.json(
      {
        error: 'Database error',
        error_code: error.code,
        msg: error.message || error.details || 'An error occurred while accessing the database'
      },
      { status: 500 }
    );
  }

  // Handle generic database errors
  if (error && typeof error === 'object' && 'code' in error) {
    const dbError = error as DatabaseError;
    return NextResponse.json(
      {
        error: 'Database error',
        error_code: String(dbError.code),
        msg: dbError.message || dbError.details || 'An error occurred while accessing the database'
      },
      { status: 500 }
    );
  }

  // Default error response
  return NextResponse.json(
    {
      error: 'Internal server error',
      error_code: 'internal_error',
      msg: error instanceof Error ? error.message : 'An unexpected error occurred'
    },
    { status: 500 }
  );
}
