const pool = require("../database/db");

(async () => {
  try {
    const [rows] = await pool.query("SELECT 1 + 1 AS result");
    console.log("DB test result:", rows);
    // optional: show current database name
    const [dbName] = await pool.query("SELECT DATABASE() as db");
    console.log("Connected to database:", dbName[0].db);
    process.exit(0);
  } catch (err) {
    console.error("DB test failed:", err.message || err);
    if (err && err.code) console.error("DB error code:", err.code);
    process.exit(1);
  }
})();
