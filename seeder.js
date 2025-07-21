//currency seeder script
import { updateCurrencyRates } from "./currency-cron.js";
import SettingsService from "./src/services/settings.service.js";
const seedCurrencyData = async () => {
  console.log("Seeding Currency Data...");
  await updateCurrencyRates();
  console.log("Currency Data Seeding Completed.");
};

seedCurrencyData();


//Delta Rate Percentage Seeder
const seedDeltaRatePercentage = async () => {
    console.log("Seeding Delta Rate Percentage...");
    const deltaRate = 4.9; // Example delta rate percentage
    await SettingsService.updateSettings("delta_percentage", deltaRate);
    console.log("Delta Rate Percentage Seeding Completed.");
};
seedDeltaRatePercentage();
