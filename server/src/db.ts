import "dotenv/config";
import mysql from "mysql2/promise";

const sslEnabled = process.env.DB_SSL === "true";
const databaseUrl = process.env.DB_URL;

const dbHost = process.env.DB_HOST;
const dbPort = Number(process.env.DB_PORT || 3306);
const dbName = process.env.DB_NAME;

console.log(
  "[db] config",
  JSON.stringify({
    usingUrl: Boolean(databaseUrl),
    host: dbHost,
    port: dbPort,
    database: dbName,
    ssl: sslEnabled
  })
);

const pool = databaseUrl
  ? mysql.createPool(databaseUrl)
  : mysql.createPool({
      host: dbHost,
      port: dbPort,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      ssl: sslEnabled ? { rejectUnauthorized: false } : undefined
    });

export default pool;
