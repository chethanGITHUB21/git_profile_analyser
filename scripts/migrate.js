const fs = require('fs/promises');
const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  try {
    const sql = await fs.readFile(__dirname + '/../database/schema.sql', 'utf8');
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error('DATABASE_URL not set in environment');

    const parsed = new URL(dbUrl);
    const conn = await mysql.createConnection({
      host: parsed.hostname,
      port: parsed.port || 3306,
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      multipleStatements: true,
    });

    console.log('Applying schema from database/schema.sql...');
    await conn.query(sql);
    console.log('Schema applied successfully.');
    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message || err);
    process.exit(1);
  }
})();
