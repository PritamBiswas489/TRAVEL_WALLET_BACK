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



//terms and conditions seeder
const seedTermsAndConditionsAndPrivacyPolicy = async () => {
    console.log("Seeding Terms and Conditions...");
    const terms = "These are the terms and conditions.";
    await SettingsService.updateSettings("terms_and_conditions", terms);
    console.log("Terms and Conditions Seeding Completed.");

    console.log("Seeding Privacy Policy...");
    const privacyPolicy = "This is the privacy policy.";
    await SettingsService.updateSettings("privacy_policy", privacyPolicy);
    console.log("Privacy Policy Seeding Completed.");
};
seedTermsAndConditionsAndPrivacyPolicy();
