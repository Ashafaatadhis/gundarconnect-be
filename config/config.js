require("dotenv").config();

module.exports = {
  development: {
    username: process.env.PG_USER || "postgres",
    password: process.env.PG_PASSWORD || "root",
    database: process.env.PG_DATABASE || "gundarconnect",
    host: process.env.PG_HOST || "127.0.0.1",
    port: process.env.PG_PORT || 5432,
    dialect: "postgres",
  },
  test: {
    username: process.env.PG_USER || "postgres",
    password: process.env.PG_PASSWORD || "root",
    database: process.env.PG_DATABASE || "gundarconnect",
    host: process.env.PG_HOST || "127.0.0.1",
    port: process.env.PG_PORT || 5432,
    dialect: "postgres",
  },
  production: {
    username: process.env.PG_USER || "postgres",
    password: process.env.PG_PASSWORD || "root",
    database: process.env.PG_DATABASE || "gundarconnect",
    host: process.env.PG_HOST || "127.0.0.1",
    port: process.env.PG_PORT || 5432,
    dialect: "postgres",
  },
};
