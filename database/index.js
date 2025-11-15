const { Pool } = require("pg");
require("dotenv").config();

let pool;

if (process.env.NODE_ENV === "development") {
  // 🧑‍💻 Local development (no SSL)
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  console.log("Connected to local database");
} else {
  // 🌐 Production (Render) — SSL required
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  });
  console.log("Connected to Render production database with SSL");
}

// ✅ Common query handler
module.exports = {
  async query(text, params) {
    try {
      const res = await pool.query(text, params);
      console.log("executed query", { text });
      return res;
    } catch (error) {
      console.error("error in query", { text, error });
      throw error;
    }
  },
};