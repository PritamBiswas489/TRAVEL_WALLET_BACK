import "./environment.js";

const isProduction = process.env.NODE_ENV === "production";

const dbConfig = {
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,

  options: {
    host: process.env.DB_HOST || "localhost",
    dialect: "postgres",
    port: Number(process.env.DB_PORT || 5432),

    dialectOptions: isProduction
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
      : {},

    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },

    logging: false,
  },
};

export default dbConfig;