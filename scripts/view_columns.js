const { Client } = require('pg');

const [,, dbUrl, tableName = 'actividades'] = process.argv;

if (!dbUrl) {
  console.error('Usage: node scripts/view_columns.js "<DATABASE_URL>" [table]');
  process.exit(1);
}

(async () => {
  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    const res = await client.query(
      `SELECT column_name, data_type, is_nullable, column_default
       FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = $1
       ORDER BY ordinal_position;`,
      [tableName]
    );

    if (res.rows.length === 0) {
      console.log(`No columns found for table '${tableName}'.`);
    } else {
      console.table(res.rows);
    }

    await client.end();
  } catch (err) {
    console.error('Error querying database:', err.message || err);
    try { await client.end(); } catch (e) {}
    process.exit(1);
  }
})();
