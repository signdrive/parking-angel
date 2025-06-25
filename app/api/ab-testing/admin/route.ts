import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server-utils';
import { ExperimentManager } from '@/lib/ab-testing/experiment-manager';

export async function GET(request: NextRequest) {
  try {
    const supabase = await getServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }    const experimentManager = new ExperimentManager();
    // TODO: Create database tables first before enabling AB testing
    const results: any[] = []; // await experimentManager.getExperimentResults();

    return NextResponse.json({
      experiments: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching AB test results:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, experimentId, config } = body;    const supabase = await getServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const experimentManager = new ExperimentManager();

    switch (action) {      case 'create':
        await experimentManager.createExperiment(config);
        break;
      case 'start':
        await experimentManager.startExperiment(experimentId);
        break;
      case 'stop':
        await experimentManager.stopExperiment(experimentId);
        break;
      case 'archive':
        await experimentManager.archiveExperiment(experimentId);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      action,
      experimentId,
    });
  } catch (error) {
    console.error('Error managing AB test:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
