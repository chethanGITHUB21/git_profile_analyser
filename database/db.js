// MySQL connection pool using mysql2/promise
const mysql = require("mysql2/promise");
require("dotenv").config();

// Expect DATABASE_URL in the form: mysql://user:pass@host:port/database
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.warn("DATABASE_URL not set in .env");
}

let pool;
try {
  if (dbUrl) {
    const parsed = new URL(dbUrl);
    pool = mysql.createPool({
      host: parsed.hostname,
      port: parsed.port || 3306,
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      database: parsed.pathname
        ? parsed.pathname.replace(/^\//, "")
        : undefined,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  } else {
    // fallback to individual env vars
    pool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASS || "",
      database: process.env.DB_NAME || undefined,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
} catch (err) {
  console.error("Failed to create MySQL pool", err);
  throw err;
}

module.exports = pool;
