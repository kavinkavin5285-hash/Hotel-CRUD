import pg from 'pg';

const { Client } = pg;
const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '521985',
  database: 'hotel_db',
});

await client.connect();

const schema = await client.query(
  "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'hotels' ORDER BY ordinal_position"
);
console.log('SCHEMA', JSON.stringify(schema.rows, null, 2));

const insert = await client.query(
  'INSERT INTO hotels (title, description, latitude, longitude, price, image) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
  ['Debug Hotel', 'Debug description', 12.9716, 77.5946, 2500, null]
);
console.log('INSERT', JSON.stringify(insert.rows[0], null, 2));

await client.end();
