// MySQL connection pool using mysql2/promise
const mysql = require("mysql2/promise");
require("dotenv").config();

// Support multiple ways to provide DB config:
// 1) MYSQL_HOST / MYSQL_USER / MYSQL_PASSWORD / MYSQL_DATABASE / MYSQL_PORT
// 2) DATABASE_URL (mysql://user:pass@host:port/database)
// 3) legacy DB_HOST / DB_USER / DB_PASS / DB_NAME / DB_PORT

const mysqlHost = process.env.MYSQL_HOST;
const mysqlUser = process.env.MYSQL_USER;
const mysqlPassword = process.env.MYSQL_PASSWORD;
const mysqlDatabase = process.env.MYSQL_DATABASE;
const mysqlPort = process.env.MYSQL_PORT;

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl && !mysqlHost && !process.env.DB_HOST) {
  console.warn("No DATABASE_URL or MYSQL_/DB_ environment variables set. Database connection may fail.");
}

let pool;
try {
  if (mysqlHost) {
    // Prefer explicit MYSQL_* env vars when provided
    pool = mysql.createPool({
      host: mysqlHost,
      port: mysqlPort || 3306,
      user: mysqlUser,
      password: mysqlPassword,
      database: mysqlDatabase,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  } else if (dbUrl) {
    // If a DATABASE_URL is provided, parse and use it
    const parsed = new URL(dbUrl);
    pool = mysql.createPool({
      host: parsed.hostname,
      port: parsed.port || 3306,
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      database: parsed.pathname ? parsed.pathname.replace(/^\//, "") : undefined,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  } else {
    // fallback to legacy DB_* env vars
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
