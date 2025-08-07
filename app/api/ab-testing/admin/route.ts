import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // EMERGENCY CIRCUIT BREAKER: Return empty data in development to prevent infinite loops
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production') {
      console.log('🛑 AB Testing API disabled in development environment');
      return NextResponse.json({ 
        experiments: [],
        message: 'AB Testing disabled in development' 
      }, { status: 200 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'experiments') {
      // Get all experiments with their stats
      const { data: experiments, error } = await supabase
        .from('ab_experiments')
        .select(`
          *,
          ab_participants(count),
          ab_conversions(count, conversion_value)
        `);

      if (error) {
        console.error('Error fetching experiments:', error);
        return NextResponse.json({ error: 'Failed to fetch experiments' }, { status: 500 });
      }

      return NextResponse.json({ experiments: experiments || [] });
    }

    // Default: return all active experiments
    const { data: experiments, error } = await supabase
      .from('ab_experiments')
      .select('*')
      .eq('status', 'active');

    if (error) {
      console.error('Error fetching active experiments:', error);
      return NextResponse.json({ error: 'Failed to fetch experiments' }, { status: 500 });
    }

    return NextResponse.json({ experiments: experiments || [] });
  } catch (error) {
    console.error('A/B Testing Admin API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, experimentData } = body;

    if (action === 'create') {
      // Create new experiment
      const { data: experiment, error } = await supabase
        .from('ab_experiments')
        .insert([{
          name: experimentData.name,
          description: experimentData.description,
          variants: experimentData.variants,
          traffic_allocation: experimentData.traffic_allocation || 1.0,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating experiment:', error);
        return NextResponse.json({ error: 'Failed to create experiment' }, { status: 500 });
      }

      return NextResponse.json({ experiment });
    }

    if (action === 'update') {
      const { id, updates } = body;
      
      const { data: experiment, error } = await supabase
        .from('ab_experiments')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating experiment:', error);
        return NextResponse.json({ error: 'Failed to update experiment' }, { status: 500 });
      }

      return NextResponse.json({ experiment });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('A/B Testing Admin POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Experiment ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('ab_experiments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting experiment:', error);
      return NextResponse.json({ error: 'Failed to delete experiment' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('A/B Testing Admin DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
