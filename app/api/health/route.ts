import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Create Supabase client with async cookies
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
          set(name, value, options) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch (error) {
              // Handle cookie errors in development
              if (process.env.NODE_ENV === 'development') {
                console.error('Cookie set error:', error);
              }
            }
          },
          remove(name, options) {
            try {
              cookieStore.delete({ name, ...options });
            } catch (error) {
              // Handle cookie errors in development
              if (process.env.NODE_ENV === 'development') {
                console.error('Cookie remove error:', error);
              }
            }
          },
        },
      }
    );

    // Check environment variables
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET',
      'NEXT_PUBLIC_SITE_URL'
    ];

    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingEnvVars.length > 0) {
      console.error('Missing environment variables:', missingEnvVars);
      return NextResponse.json({
        status: 'error',
        message: 'Missing required environment variables',
        timestamp: new Date().toISOString(),
        details: process.env.NODE_ENV === 'development' ? missingEnvVars : undefined
      }, { 
        status: 503,
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
          'Pragma': 'no-cache',
        }
      });
    }

    // Check Supabase connection
    const { data, error } = await supabase.from('health_checks').select('id').limit(1);
    
    if (error) {
      console.error('Supabase health check error:', error);
      return NextResponse.json({
        status: 'error',
        message: 'Database connection error',
        timestamp: new Date().toISOString(),
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, { 
        status: 503,
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
          'Pragma': 'no-cache',
        }
      });
    }

    // Check auth service
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError) {
      console.error('Auth service error:', authError);
      return NextResponse.json({
        status: 'error',
        message: 'Auth service error',
        timestamp: new Date().toISOString(),
        details: process.env.NODE_ENV === 'development' ? authError : undefined
      }, { 
        status: 503,
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
          'Pragma': 'no-cache',
        }
      });
    }

    // All checks passed
    return NextResponse.json({
      status: 'healthy',
      message: 'All systems operational',
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV
    }, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'Pragma': 'no-cache',
      }
    });

  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'Pragma': 'no-cache',
      }
    });
  }
}
