#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAndFixDatabase() {
  console.log('🔍 Checking database schema...');

  try {
    // Check if parking_spots table exists
    console.log('📍 Checking parking_spots table...');
    
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_table_info', { table_name: 'parking_spots' })
      .single();

    if (tablesError || !tables) {
      console.log('📝 Creating parking_spots table...');
      
      // Create the parking_spots table with proper schema
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS parking_spots (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            address TEXT,
            latitude DECIMAL(10, 8),
            longitude DECIMAL(11, 8),
            status VARCHAR(50) DEFAULT 'active',
            spot_type VARCHAR(100),
            pricing_info JSONB,
            availability_info JSONB,
            features TEXT[],
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_by UUID REFERENCES profiles(id)
          );

          -- Create indexes for performance
          CREATE INDEX IF NOT EXISTS idx_parking_spots_location ON parking_spots(latitude, longitude);
          CREATE INDEX IF NOT EXISTS idx_parking_spots_status ON parking_spots(status);
          CREATE INDEX IF NOT EXISTS idx_parking_spots_created_at ON parking_spots(created_at);

          -- Enable RLS
          ALTER TABLE parking_spots ENABLE ROW LEVEL SECURITY;

          -- Create policies
          CREATE POLICY "Public can view active parking spots" ON parking_spots
            FOR SELECT USING (status = 'active');

          CREATE POLICY "Authenticated users can insert parking spots" ON parking_spots
            FOR INSERT WITH CHECK (auth.role() = 'authenticated');

          CREATE POLICY "Users can update their own spots" ON parking_spots
            FOR UPDATE USING (auth.uid() = created_by);

          CREATE POLICY "Admins can do everything" ON parking_spots
            FOR ALL USING (
              EXISTS (
                SELECT 1 FROM profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.role = 'admin'
              )
            );
        `
      });

      if (createError) {
        console.error('❌ Error creating parking_spots table:', createError);
      } else {
        console.log('✅ parking_spots table created successfully');
      }
    } else {
      console.log('✅ parking_spots table exists');
      
      // Check if created_at column exists
      const { data: columns, error: columnsError } = await supabase
        .rpc('get_column_info', { 
          table_name: 'parking_spots',
          column_name: 'created_at'
        });

      if (columnsError || !columns) {
        console.log('📝 Adding created_at column to parking_spots...');
        
        const { error: alterError } = await supabase.rpc('exec_sql', {
          sql: `
            ALTER TABLE parking_spots 
            ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
            
            -- Update existing rows
            UPDATE parking_spots SET created_at = NOW() WHERE created_at IS NULL;
          `
        });

        if (alterError) {
          console.error('❌ Error adding created_at column:', alterError);
        } else {
          console.log('✅ created_at column added successfully');
        }
      } else {
        console.log('✅ created_at column exists');
      }
    }

    // Test the query that was failing
    console.log('🧪 Testing parking spots query...');
    const { data: testData, error: testError } = await supabase
      .from('parking_spots')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (testError) {
      console.warn('⚠️  Query still has issues:', testError);
      
      // Try without ordering
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('parking_spots')
        .select('*')
        .limit(5);

      if (fallbackError) {
        console.error('❌ Fallback query failed:', fallbackError);
      } else {
        console.log('✅ Fallback query works, found', fallbackData?.length || 0, 'spots');
      }
    } else {
      console.log('✅ Query works perfectly, found', testData?.length || 0, 'spots');
    }

    // Check other essential tables
    console.log('📊 Checking other essential tables...');
    
    const essentialTables = ['profiles', 'spot_reports'];
    for (const tableName of essentialTables) {
      const { data, error } = await supabase
        .from(tableName)
        .select('count(*)', { count: 'exact', head: true });

      if (error) {
        console.warn(`⚠️  ${tableName} table issue:`, error.message);
      } else {
        console.log(`✅ ${tableName} table accessible`);
      }
    }

    console.log('🎉 Database check completed!');

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Add helper functions that might be missing
async function createHelperFunctions() {
  console.log('🔧 Setting up helper functions...');

  const helperFunctions = [
    {
      name: 'get_table_info',
      sql: `
        CREATE OR REPLACE FUNCTION get_table_info(table_name text)
        RETURNS TABLE(table_exists boolean)
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          RETURN QUERY
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          );
        END;
        $$;
      `
    },
    {
      name: 'get_column_info', 
      sql: `
        CREATE OR REPLACE FUNCTION get_column_info(table_name text, column_name text)
        RETURNS TABLE(column_exists boolean)
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          RETURN QUERY
          SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = $1
            AND column_name = $2
          );
        END;
        $$;
      `
    },
    {
      name: 'exec_sql',
      sql: `
        CREATE OR REPLACE FUNCTION exec_sql(sql text)
        RETURNS void
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          EXECUTE sql;
        END;
        $$;
      `
    }
  ];

  for (const func of helperFunctions) {
    try {
      const { error } = await supabase.rpc('exec', { sql: func.sql });
      if (error) {
        console.warn(`⚠️  Could not create ${func.name}:`, error.message);
      } else {
        console.log(`✅ ${func.name} function ready`);
      }
    } catch (err) {
      console.warn(`⚠️  ${func.name} setup issue:`, err.message);
    }
  }
}

async function main() {
  console.log('🚀 Starting database diagnostics and fixes...\n');
  
  try {
    await createHelperFunctions();
    await checkAndFixDatabase();
  } catch (error) {
    console.error('💥 Main process failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkAndFixDatabase };
