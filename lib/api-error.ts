import { NextResponse } from 'next/server';

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

  // Handle Supabase errors
  if (error && typeof error === 'object' && 'code' in error) {
    return NextResponse.json(
      {
        error: 'Database error',
        error_code: String(error.code),
        msg: error.message || 'An error occurred while accessing the database'
      },
      { status: 500 }
    );
  }

  // Default error response
  return NextResponse.json(
    {
      error: 'Internal server error',
      error_code: 'internal_error',
      msg: 'An unexpected error occurred'
    },
    { status: 500 }
  );
}
