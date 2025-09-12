//currency seeder script
import { updateCurrencyRates } from "./currency-cron.js";
import SettingsService from "./src/services/settings.service.js";
import UserService from "./src/services/user.service.js";
import ExpensesService from "./src/services/expenses.service.js";
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


//create admin user seeder
const seedAdminUser = async () => {
    console.log("Seeding Admin User...");
    await UserService.createDefaultAdminUser();
    console.log("Admin User Seeding Completed.");
}
seedAdminUser();


//create default expenses seeder
const seedDefaultExpenses = async () => {
    console.log("Seeding Default Expenses...");
    await ExpensesService.clearExpenseTable(); // Clear existing entries before seeding
    const defaultExpenses = [
      {
        icon: "Ionicons",
        name: "chatbox-ellipses-outline",
        title: "General",
        color: "#F57C00",
      },
      {
        icon: "Ionicons",
        name: "bed-outline",
        title: "Accommodation",
        color: "#B71C1C",
      },
      {
        icon: "Ionicons",
        name: "bus-outline",
        title: "Transportation",
        color: "#FF6F00",
      },
      {
        icon: "Ionicons",
        name: "map-outline",
        title: "Sightseeing & Tours",
        color: "#43A047",
      },
      {
        icon: "Ionicons",
        name: "restaurant-outline",
        title: "Food & Drinks",
        color: "#00897B",
      },
      {
        icon: "Ionicons",
        name: "bag-handle-outline",
        title: "Shopping",
        color: "#388E3C",
      },
      {
        icon: "Ionicons",
        name: "flower-outline",
        title: "Spa & Wellness",
        color: "#E91E63",
      },
      {
        icon: "Ionicons",
        name: "film-outline",
        title: "Entertainment",
        color: "#E53935",
      },
      {
        icon: "Ionicons",
        name: "gift-outline",
        title: "Gifts",
        color: "#8E24AA",
      },
    ];
    for (const expense of defaultExpenses) {
        await ExpensesService.createExpense(expense);
    }
    console.log("Default Expenses Seeding Completed.");
}

seedDefaultExpenses();
