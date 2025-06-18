import { NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Create Supabase client
    const supabase = createServerComponentClient({ cookies });

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
      }, { status: 503 });
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
      }, { status: 503 });
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
      }, { status: 503 });
    }

    // All checks passed
    return NextResponse.json({
      status: 'healthy',
      message: 'System is operational',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'connected',
        auth: 'operational',
        envVars: 'configured'
      },
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, must-revalidate'
      }
    });

  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
}
