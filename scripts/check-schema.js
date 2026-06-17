const pool = require("../database/db");

(async () => {
  try {
    const [dbRow] = await pool.query("SELECT DATABASE() as db");
    const dbName = dbRow[0].db;
    const [rows] = await pool.query(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?",
      [dbName],
    );
    const tables = rows.map((r) => r.TABLE_NAME);
    console.log(JSON.stringify({ database: dbName, tables }, null, 2));
    process.exit(0);
  } catch (err) {
    console.error("Schema check failed:", err.message || err);
    process.exit(1);
  }
})();
