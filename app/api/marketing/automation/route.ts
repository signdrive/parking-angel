import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server-utils';
import { MarketingAutomationManager } from '@/lib/marketing/automation-manager';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);    const type = searchParams.get('type') || 'campaigns';

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
    }

    const marketingManager = new MarketingAutomationManager();

    switch (type) {
      case 'campaigns':
        const campaigns = await marketingManager.getCampaigns();
        return NextResponse.json({ campaigns });

      case 'segments':
        const segments = await marketingManager.getSegments();
        return NextResponse.json({ segments });

      case 'triggers':
        const triggers = await marketingManager.getTriggers();
        return NextResponse.json({ triggers });

      case 'metrics':
        const campaignId = searchParams.get('campaignId');
        if (!campaignId) {
          return NextResponse.json(
            { error: 'Campaign ID required for metrics' },
            { status: 400 }
          );
        }        const dateRange = {
          start: searchParams.get('start') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end: searchParams.get('end') || new Date().toISOString(),
        };

        // TODO: Update getCampaignMetrics to accept dateRange when database is implemented
        const metrics = await marketingManager.getCampaignMetrics(campaignId);
        return NextResponse.json({ metrics });

      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in marketing automation API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();    const { action, type, data } = body;

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
    }

    const marketingManager = new MarketingAutomationManager();

    switch (action) {
      case 'create':
        let result;
        switch (type) {
          case 'campaign':
            result = await marketingManager.createCampaign(data);
            break;
          case 'segment':
            result = await marketingManager.createSegment(data);
            break;
          case 'trigger':
            result = await marketingManager.createTrigger(data);
            break;
          case 'welcome_campaign':
            result = await marketingManager.createWelcomeCampaign();
            break;
          case 'upsell_campaign':
            result = await marketingManager.createUpsellCampaign();
            break;
          case 'churn_prevention_campaign':
            result = await marketingManager.createChurnPreventionCampaign();
            break;
          default:
            return NextResponse.json(
              { error: 'Invalid creation type' },
              { status: 400 }
            );
        }

        return NextResponse.json({
          success: true,
          id: result,
          type,
        });

      case 'update':
        switch (type) {
          case 'campaign':
            await marketingManager.updateCampaign(data.id, data.updates);
            break;
          case 'segment_count':
            const userCount = await marketingManager.updateSegmentUserCount(data.segmentId);
            return NextResponse.json({
              success: true,
              userCount,
            });
          default:
            return NextResponse.json(
              { error: 'Invalid update type' },
              { status: 400 }
            );
        }

        return NextResponse.json({
          success: true,
          type,
        });

      case 'delete':
        switch (type) {
          case 'campaign':
            await marketingManager.deleteCampaign(data.id);
            break;
          default:
            return NextResponse.json(
              { error: 'Invalid deletion type' },
              { status: 400 }
            );
        }

        return NextResponse.json({
          success: true,
          type,
        });

      case 'process_event':
        // Process user event for automation triggers
        await marketingManager.processUserEvent(data.userId, data.event, data.metadata);
        return NextResponse.json({
          success: true,
          event: data.event,
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in marketing automation POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
