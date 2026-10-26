import { performance } from "node:perf_hooks";
import dbConfig from "../config/database.js";
import { Sequelize } from "sequelize";

async function testFreshConnections() {
  console.log("Node.js:", process.version);
  console.log("Database host:", dbConfig.options.host);

  for (let i = 1; i <= 5; i++) {
    const sequelize = new Sequelize(
      dbConfig.database,
      dbConfig.username,
      dbConfig.password,
      {
        ...dbConfig.options,
        logging: false,
        pool: {
          max: 1,
          min: 0,
        },
      }
    );

    try {
      const start = performance.now();

      await sequelize.authenticate();

      console.log(
        `Connection ${i}: ${(performance.now() - start).toFixed(2)} ms`
      );
    } catch (error) {
      console.error(`Connection ${i} failed:`, error.message);
    } finally {
      await sequelize.close();
    }
  }
}

testFreshConnections();