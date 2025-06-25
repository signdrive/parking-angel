import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server-utils';
import { ExperimentManager } from '@/lib/ab-testing/experiment-manager';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const experimentId = searchParams.get('experimentId');    if (!experimentId) {
      return NextResponse.json(
        { error: 'Experiment ID is required' },
        { status: 400 }
      );
    }

    const supabase = await getServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const experimentManager = new ExperimentManager();
    const variant = await experimentManager.getVariant(experimentId, user.id);

    return NextResponse.json({
      experimentId,
      variant,
      userId: user.id,
    });
  } catch (error) {
    console.error('Error getting AB test variant:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { experimentId, conversionType, value } = body;

    if (!experimentId || !conversionType) {
      return NextResponse.json(
        { error: 'Experiment ID and conversion type are required' },
        { status: 400 }      );
    }

    const supabase = await getServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }    const experimentManager = new ExperimentManager();
    await experimentManager.trackConversion(experimentId, user.id, value);

    return NextResponse.json({
      success: true,
      experimentId,
      conversionType,
      value,
    });
  } catch (error) {
    console.error('Error tracking AB test conversion:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
