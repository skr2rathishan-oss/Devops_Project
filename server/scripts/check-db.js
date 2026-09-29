// Checks that the server can reach MySQL with the settings in .env.
// Run with: npm run db:check
require("dotenv").config();
const pool = require("../src/config/db");

(async () => {
  try {
    const [[{ db }]] = await pool.query("SELECT DATABASE() AS db");
    const [tables] = await pool.query("SHOW TABLES");
    const [[{ users }]] = await pool.query("SELECT COUNT(*) AS users FROM users");
    console.log(`Connected to "${db}" as ${process.env.DB_USER}@${process.env.DB_HOST}:${process.env.DB_PORT}`);
    console.log(`Tables: ${tables.map((t) => Object.values(t)[0]).join(", ")}`);
    console.log(`Users in table: ${users}`);
  } catch (err) {
    const hints = {
      ECONNREFUSED: "MySQL isn't running on that host/port. Start the MySQL80 service.",
      ER_ACCESS_DENIED_ERROR: "Wrong DB_USER/DB_PASSWORD. Run database/setup_local.sql as root.",
      ER_BAD_DB_ERROR: "Database doesn't exist. Run database/setup_local.sql as root.",
      ER_NO_SUCH_TABLE: "Tables are missing. Run database/init.sql.",
    };
    console.error(`Database check failed: ${err.code || ""} ${err.message}`);
    if (hints[err.code]) console.error(`Hint: ${hints[err.code]}`);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
