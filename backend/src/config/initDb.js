const pool = require('./database');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  try {
    console.log('🔧 Initializing database...');

    const schemaSQL = fs.readFileSync(
      path.join(__dirname, 'schema.sql'),
      'utf-8'
    );

    await pool.query(schemaSQL);

    console.log('✓ Database schema created successfully!');
    console.log('✓ PostGIS extension enabled');
    console.log('✓ Tables created');
    console.log('✓ Indexes created');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

initializeDatabase();
