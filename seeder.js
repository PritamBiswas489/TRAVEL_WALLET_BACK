//currency seeder script
import { updateCurrencyRates } from "./currency-cron.js";
import SettingsService from "./src/services/settings.service.js";
import UserService from "./src/services/user.service.js";
import ExpensesCategoriesService from "./src/services/expenses.categories.service.js";
import FeedbackService from "./src/services/feedbackService.js";
import SuggestionService from "./src/services/SuggestionService.js";
import BugReportService from "./src/services/bugReportService.js";
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
    await ExpensesCategoriesService.clearExpenseTable(); // Clear existing entries before seeding
    const defaultExpensesCategories = [
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
    for (const expense of defaultExpensesCategories) {
        await ExpensesCategoriesService.createExpense(expense);
    }
    console.log("Default Expenses Seeding Completed.");
}

seedDefaultExpenses();

const createFeedbackCategories = async () => {
  await FeedbackService.clearFeedbackCategoryTable(); // Clear existing entries before seeding
  const feedbackCategories = [
    {
      engText: 'Transactions',
      heText: 'עסקאות',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      engText: 'Wallet Balance',
      heText: 'יתרת ארנק',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      engText: 'Money Transfer',
      heText: 'העברת כספים',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      engText: 'Bill Payments',
      heText: 'תשלומי חשבונות',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      engText: 'Security',
      heText: 'אבטחה',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      engText: 'User Interface',
      heText: 'ממשק משתמש',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      engText: 'Other',
      heText: 'אחר',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  console.log("Seeding Feedback Categories...");
  await FeedbackService.addCategories(feedbackCategories);
  console.log("Feedback Categories Seeding Completed.");

}

createFeedbackCategories();


const createSuggestionTypes = async () => {
  await SuggestionService.clearSuggestionTypeTable(); // Clear existing entries before seeding
  const suggestionTypes = [
    {
      engText: 'New Feature',
      heText: 'תכונה חדשה',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      engText: 'Improvement',
      heText: 'שיפור',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      engText: 'Design Enhancement',
      heText: 'שיפור עיצוב',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      engText: 'Performance',
      heText: 'ביצועים',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      engText: 'Other',
      heText: 'אחר',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  console.log("Seeding Suggestion Types...");
  await SuggestionService.addSuggestionType(suggestionTypes);
  console.log("Suggestion Types Seeding Completed.");
}
createSuggestionTypes();


const createSuggestionPriorityLevels = async () => {
   await SuggestionService.clearSuggestionPriorityLevelTable(); // Clear existing entries before seeding
    const suggestionPriorityLevels = [
      {
        engText: "Nice to Have",
        heText: "נחמד שיהיה",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        engText: "Would Be Helpful",
        heText: "יכול לעזור",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        engText: "Very Important",
        heText: "מאוד חשוב",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        engText: "Critical",
        heText: "קריטי",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
      console.log("Seeding Suggestion Priority Levels...");
      await SuggestionService.addSuggestionPriorityLevels(suggestionPriorityLevels);
      console.log("Suggestion Priority Levels Seeding Completed.");

}

createSuggestionPriorityLevels();

const createBugSeverity = async () => {
  await BugReportService.clearBugSeverityTable(); // Clear existing entries before seeding
  const bugSeverities = [
    {
      engText: "Low - Minor Issue",
      heText: "נמוך - בעיה מינורית",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      engText: "Medium - Inconvenient",
      heText: "בינוני - בעיה לא נוחה",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      engText: "High - Major Problem",
      heText: "גבוה - בעיה משמעותית",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      engText: "Critical - App Unusable",
      heText: "קריטי - האפליקציה לא שמישה",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  console.log("Seeding Bug Severities...");
  await BugReportService.addBugSeverity(bugSeverities);
  console.log("Bug Severities Seeding Completed.");
};
createBugSeverity();


const createBugPlaces = async () => {
  await BugReportService.clearBugPlaceTable(); // Clear existing entries before seeding
  const bugPlaces = [
    {
      engText: "Login/Registration",
      heText: "כניסה/הרשמה",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      engText: "Dashboard",
      heText: "לוח מחוונים",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      engText: "Send Money",
      heText: "שלח כסף",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
     {
      engText: "Request Money",
      heText: "בקשת כסף",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
     {
      engText: "Transaction History",
      heText: "היסטוריית עסקאות",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      engText: "Bill Payments",
      heText: "תשלומי חשבונות",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
     {
      engText: "Cards/Accounts",
      heText: "כרטיסים/חשבונות",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      engText: "Settings",
      heText: "הגדרות",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      engText: "Other",
      heText: "אחר",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  console.log("Seeding Bug Places...");
  await BugReportService.addBugPlaces(bugPlaces);
  console.log("Bug Places Seeding Completed.");
}
createBugPlaces();
