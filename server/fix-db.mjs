import pg from 'pg';

const { Client } = pg;
const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '521985',
  database: 'hotel_db'
});

try {
  await client.connect();
  const columnsResult = await client.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name = 'hotels' ORDER BY ordinal_position"
  );
  const columns = new Set(columnsResult.rows.map((row) => row.column_name));

  if (!columns.has('image') && columns.has('image_path')) {
    await client.query('ALTER TABLE hotels RENAME COLUMN image_path TO image');
    console.log('Renamed image_path -> image');
  }

  if (!columns.has('image') && !columns.has('image_path')) {
    await client.query('ALTER TABLE hotels ADD COLUMN image TEXT');
    console.log('Added image column');
  }

  const finalColumns = await client.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name = 'hotels' ORDER BY ordinal_position"
  );
  console.log('Final columns:', finalColumns.rows.map((row) => row.column_name));
} catch (error) {
  console.error('DB_FIX_ERROR:', error.message);
  process.exit(1);
} finally {
  await client.end();
}
