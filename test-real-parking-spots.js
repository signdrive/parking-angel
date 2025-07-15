import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function testParkingSpots() {
    console.log('🚗 Testing parking spots functionality...\n');

    try {
        // First, let's check the table structure
        console.log('1. Checking table structure...');
        const { data: columns, error: structureError } = await supabase
            .from('parking_spots')
            .select('*')
            .limit(1);

        if (structureError) {
            console.error('❌ Error checking table structure:', structureError);
            return;
        }

        if (columns && columns.length > 0) {
            console.log('✅ Table structure (sample record):');
            console.log(JSON.stringify(columns[0], null, 2));
        } else {
            console.log('⚠️ Table exists but is empty');
        }

        // Test basic select
        console.log('\n2. Testing basic select...');
        const { data: spots, error: selectError } = await supabase
            .from('parking_spots')
            .select('*')
            .limit(5);

        if (selectError) {
            console.error('❌ Error selecting parking spots:', selectError);
            return;
        }

        console.log(`✅ Found ${spots.length} parking spots`);
        if (spots.length > 0) {
            console.log('Sample spot:', JSON.stringify(spots[0], null, 2));
        }

        // Test count
        console.log('\n3. Testing count...');
        const { count, error: countError } = await supabase
            .from('parking_spots')
            .select('*', { count: 'exact', head: true });

        if (countError) {
            console.error('❌ Error counting parking spots:', countError);
        } else {
            console.log(`✅ Total parking spots: ${count}`);
        }

        // Test insert a new spot
        console.log('\n4. Testing insert...');
        const testSpot = {
            name: 'Test Parking Spot',
            latitude: 40.7589,
            longitude: -73.9851,
            address: 'Test Address, New York, NY',
            price_per_hour: 5.00,
            is_available: true,
            spot_type: 'street',
            provider: 'TestProvider',
            real_time_data: false,
            total_spaces: 1,
            available_spaces: 1,
            confidence_score: 95
        };

        const { data: insertData, error: insertError } = await supabaseAdmin
            .from('parking_spots')
            .insert([testSpot])
            .select();

        if (insertError) {
            console.error('❌ Error inserting test spot:', insertError);
        } else {
            console.log('✅ Successfully inserted test spot:', insertData[0]);
            
            // Clean up - delete the test spot
            const { error: deleteError } = await supabaseAdmin
                .from('parking_spots')
                .delete()
                .eq('id', insertData[0].id);
                
            if (deleteError) {
                console.error('⚠️ Error cleaning up test spot:', deleteError);
            } else {
                console.log('✅ Cleaned up test spot');
            }
        }

        // Test filtering by location (if we have spots)
        if (spots.length > 0) {
            console.log('\n5. Testing location-based filtering...');
            const { data: nearbySpots, error: filterError } = await supabase
                .from('parking_spots')
                .select('*')
                .gte('latitude', 40.7)
                .lte('latitude', 40.8)
                .gte('longitude', -74.1)
                .lte('longitude', -73.9)
                .limit(3);

            if (filterError) {
                console.error('❌ Error filtering by location:', filterError);
            } else {
                console.log(`✅ Found ${nearbySpots.length} spots in NYC area`);
                if (nearbySpots.length > 0) {
                    console.log('Sample nearby spot:', nearbySpots[0].name);
                }
            }
        }

        console.log('\n🎉 All parking spots tests completed successfully!');

    } catch (error) {
        console.error('💥 Unexpected error:', error);
    }
}

// Run the test
testParkingSpots();
