const mysql = require("mysql2/promise");
const fs = require("fs");

const useSSL = process.env.DB_SSL === "true";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  ssl: useSSL
    ? {
        minVersion: "TLSv1.2",
        ca: process.env.DB_SSL_CA ? fs.readFileSync(process.env.DB_SSL_CA) : undefined,
        rejectUnauthorized: true,
      }
    : undefined,
});

module.exports = pool;
