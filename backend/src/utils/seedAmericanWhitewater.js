const axios = require('axios');
const pool = require('../config/database');

// American Whitewater API endpoint
const AW_API_BASE = 'https://www.americanwhitewater.org/content/River/view/river-detail';

/**
 * Fetch rapids data from American Whitewater
 * Note: American Whitewater doesn't have a public REST API, so we'll create sample data
 * In a production app, you'd need to work with AW directly or scrape their data legally
 */
async function seedSampleData() {
  console.log('🌊 Seeding sample whitewater rapids data...');

  const sampleRapids = [
    {
      name: 'Lochsa Falls',
      river: 'Lochsa River',
      description: 'A technical Class IV rapid with a significant drop. Scout carefully on river left.',
      latitude: 46.4583,
      longitude: -115.6389,
      difficulty: 'IV',
      length_miles: 0.2,
      gradient_fppm: 80,
      optimal_flow_min: 1500,
      optimal_flow_max: 4000,
      season: 'May-June',
      hazards: ['Large rocks', 'Strong hydraulics', 'Undercut ledge on right'],
      access_notes: 'Highway 12 parallels the river. Multiple pull-outs available.',
      permit_required: false,
    },
    {
      name: 'Lava Falls',
      river: 'Colorado River',
      description: 'Legendary Class V (or X at high water) rapid in the Grand Canyon. One of the most famous rapids in North America.',
      latitude: 36.2128,
      longitude: -113.1222,
      difficulty: 'V',
      length_miles: 0.15,
      gradient_fppm: 37,
      optimal_flow_min: 10000,
      optimal_flow_max: 25000,
      season: 'April-September',
      hazards: ['Massive waves', 'Powerful holes', 'Rock garden'],
      access_notes: 'Grand Canyon permit required. Multi-day trip necessary.',
      permit_required: true,
    },
    {
      name: 'Carnage Corner',
      river: 'Payette River (North Fork)',
      description: 'Challenging Class IV+ rapid with tight technical moves and powerful hydraulics.',
      latitude: 44.7367,
      longitude: -115.9556,
      difficulty: 'IV+',
      length_miles: 0.1,
      gradient_fppm: 110,
      optimal_flow_min: 800,
      optimal_flow_max: 2500,
      season: 'June-July',
      hazards: ['Powerful hole', 'Sieves', 'Undercuts'],
      access_notes: 'Banks-Lowman Road provides access. Popular commercial section.',
      permit_required: false,
    },
    {
      name: 'Big Mallard',
      river: 'Chattooga River',
      description: 'Classic southeastern Class IV rapid. Technical boulder garden requiring precise boat control.',
      latitude: 34.9267,
      longitude: -83.1533,
      difficulty: 'IV',
      length_miles: 0.15,
      gradient_fppm: 50,
      optimal_flow_min: 1.5,
      optimal_flow_max: 2.5,
      season: 'March-May, after rain',
      hazards: ['Boulder maze', 'Pinning potential', 'Recirculating holes'],
      access_notes: 'Section III put-in at Earl\'s Ford. Parking available.',
      permit_required: false,
    },
    {
      name: 'Pinball',
      river: 'Arkansas River',
      description: 'Fast-paced Class IV rapid in the Numbers section. Continuous boulder dodging required.',
      latitude: 38.9231,
      longitude: -106.2456,
      difficulty: 'IV',
      length_miles: 0.25,
      gradient_fppm: 90,
      optimal_flow_min: 600,
      optimal_flow_max: 1500,
      season: 'May-July',
      hazards: ['Continuous boulders', 'Narrow channels', 'Keeper holes'],
      access_notes: 'Highway 24 access. Popular commercial stretch.',
      permit_required: false,
    },
    {
      name: 'Crystal Rapid',
      river: 'Colorado River',
      description: 'Notorious Grand Canyon rapid. Created by a flash flood in 1966, it features a massive hole.',
      latitude: 36.1147,
      longitude: -112.3428,
      difficulty: 'IV-V',
      length_miles: 0.1,
      gradient_fppm: 15,
      optimal_flow_min: 10000,
      optimal_flow_max: 20000,
      season: 'April-September',
      hazards: ['Crystal Hole', 'Rock garden', 'Powerful waves'],
      access_notes: 'Grand Canyon permit required. Mile 98.',
      permit_required: true,
    },
    {
      name: 'Pillow Rock',
      river: 'Gauley River',
      description: 'The most famous rapid on the Gauley. A huge undercut rock in the center creates multiple routes.',
      latitude: 38.1728,
      longitude: -80.9744,
      difficulty: 'V',
      length_miles: 0.1,
      gradient_fppm: 28,
      optimal_flow_min: 1200,
      optimal_flow_max: 3500,
      season: 'September-October (dam releases)',
      hazards: ['Undercut pillow rock', 'Powerful holes', 'Reversal'],
      access_notes: 'Upper Gauley section. Summersville Dam releases.',
      permit_required: false,
    },
    {
      name: 'Sunshine Falls',
      river: 'White Salmon River',
      description: 'Beautiful Class IV ledge drop. Clean line down the center or technical river right route.',
      latitude: 45.7567,
      longitude: -121.5144,
      difficulty: 'IV',
      length_miles: 0.05,
      gradient_fppm: 75,
      optimal_flow_min: 1200,
      optimal_flow_max: 3000,
      season: 'Year-round',
      hazards: ['Ledge hole', 'Rocks at bottom', 'Recirculation'],
      access_notes: 'Husum put-in. Popular day trip destination.',
      permit_required: false,
    },
    {
      name: 'Clavey Falls',
      river: 'Tuolumne River',
      description: 'Iconic Class V rapid. A series of large drops culminating in the main falls.',
      latitude: 37.9167,
      longitude: -120.2167,
      difficulty: 'V',
      length_miles: 0.15,
      gradient_fppm: 120,
      optimal_flow_min: 1800,
      optimal_flow_max: 6000,
      season: 'April-July',
      hazards: ['Large drops', 'Powerful hydraulics', 'Rock sieves'],
      access_notes: 'Multi-day trip from Meral\'s Pool or Cherry Creek.',
      permit_required: true,
    },
    {
      name: 'Jacob\'s Ladder',
      river: 'Payette River (South Fork)',
      description: 'Technical Class IV+ staircase rapid. Multiple ledges requiring precise lines.',
      latitude: 44.1889,
      longitude: -115.5628,
      difficulty: 'IV+',
      length_miles: 0.2,
      gradient_fppm: 100,
      optimal_flow_min: 2000,
      optimal_flow_max: 5000,
      season: 'May-June',
      hazards: ['Stacked ledges', 'Holes', 'Tight channels'],
      access_notes: 'Highway 21 access. Staircase section.',
      permit_required: false,
    },
  ];

  try {
    let successCount = 0;
    let errorCount = 0;

    for (const rapid of sampleRapids) {
      try {
        const result = await pool.query(
          `INSERT INTO rapids
           (name, river, description, location, difficulty, length_miles, gradient_fppm,
            optimal_flow_min, optimal_flow_max, season, hazards, access_notes, permit_required)
           VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326)::geography, $6, $7, $8, $9, $10, $11, $12, $13, $14)
           ON CONFLICT DO NOTHING
           RETURNING id`,
          [
            rapid.name,
            rapid.river,
            rapid.description,
            rapid.longitude,
            rapid.latitude,
            rapid.difficulty,
            rapid.length_miles,
            rapid.gradient_fppm,
            rapid.optimal_flow_min,
            rapid.optimal_flow_max,
            rapid.season,
            rapid.hazards,
            rapid.access_notes,
            rapid.permit_required,
          ]
        );

        if (result.rows.length > 0) {
          successCount++;
          console.log(`✓ Added: ${rapid.name} on ${rapid.river}`);
        }
      } catch (err) {
        errorCount++;
        console.error(`✗ Failed to add ${rapid.name}:`, err.message);
      }
    }

    console.log(`\n🎉 Seeding complete!`);
    console.log(`   Success: ${successCount} rapids`);
    console.log(`   Errors: ${errorCount} rapids`);

    // Add some sample flow data
    console.log('\n💧 Adding sample flow data...');
    const rapidsResult = await pool.query('SELECT id FROM rapids LIMIT 5');

    for (const rapid of rapidsResult.rows) {
      await pool.query(
        `INSERT INTO flow_data (rapid_id, gauge_id, flow_cfs, gauge_height_ft, temperature_f, recorded_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [
          rapid.id,
          'USGS-' + Math.floor(Math.random() * 100000),
          Math.floor(Math.random() * 3000) + 500,
          Math.random() * 5 + 2,
          Math.random() * 20 + 45,
        ]
      );
    }

    console.log('✓ Sample flow data added');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedSampleData()
    .then(() => {
      console.log('✓ Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('✗ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedSampleData };
