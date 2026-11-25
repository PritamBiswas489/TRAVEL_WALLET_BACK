// Database seeder
//
// Usage:
//   node seeder.js --list                     List available seeders
//   node seeder.js --only=adminUser,deltaRate Run specific seeders
//   node seeder.js --all                      Run every seeder
//   node seeder.js --all --force              Required in production when destructive seeders run

import { parseArgs } from "node:util";
import { updateCurrencyRates } from "./currency-cron.js";
import SettingsService from "./src/services/settings.service.js";
import UserService from "./src/services/user.service.js";
import ExpensesCategoriesService from "./src/services/expenses.categories.service.js";
import FeedbackService from "./src/services/feedbackService.js";
import SuggestionService from "./src/services/suggestionService.js";
import BugReportService from "./src/services/bugReportService.js";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/** Adds createdAt/updatedAt to each item (one shared timestamp per batch). */
const withTimestamps = (items) => {
  const now = new Date();
  return items.map((item) => ({ ...item, createdAt: now, updatedAt: now }));
};

/** Converts [[eng, he], ...] into [{ engText, heText }, ...]. */
const bilingual = (pairs) =>
  pairs.map(([engText, heText]) => ({ engText, heText }));

/** Wraps a seeder body with start/finish logging. */
const logged = (label, fn) => async () => {
  console.log(`Seeding ${label}...`);
  await fn();
  console.log(`${label} seeding completed.`);
};

/* -------------------------------------------------------------------------- */
/* Seed data                                                                  */
/* -------------------------------------------------------------------------- */

const DELTA_RATE_PERCENTAGE = 4.9;
const VIRTUAL_DEBIT_CARD_CHARGE = 1.5;

const TERMS_AND_CONDITIONS = "These are the terms and conditions.";
const PRIVACY_POLICY = "This is the privacy policy.";

const DIRECT_BANK_TRANSFER_FEES_PERCENTAGE = 1.5;
const DIRECT_BANK_TRANSFER_FEES_FIXED = 3;
const DIRECT_BANK_TRANSFER_FEES = {
  percentage: DIRECT_BANK_TRANSFER_FEES_PERCENTAGE,
  fixed: DIRECT_BANK_TRANSFER_FEES_FIXED,
  type: "PERCENTAGE"
};

const expenseCategory = (name, title, hebrewTitle, color) => ({
  icon: "Ionicons",
  name,
  title,
  hebrewTitle,
  color,
});

const DEFAULT_EXPENSE_CATEGORIES = [
  expenseCategory("chatbox-ellipses-outline", "General", "כללי", "#F57C00"),
  expenseCategory("bed-outline", "Accommodation", "לינה", "#B71C1C"),
  expenseCategory("bus-outline", "Transportation", "תחבורה", "#FF6F00"),
  expenseCategory("map-outline", "Sightseeing & Tours", "אטרקציות וסיורים", "#43A047"),
  expenseCategory("restaurant-outline", "Food & Drinks", "אוכל ושתייה", "#00897B"),
  expenseCategory("bag-handle-outline", "Shopping", "קניות", "#388E3C"),
  expenseCategory("flower-outline", "Spa & Wellness", "ספא ובריאות", "#E91E63"),
  expenseCategory("film-outline", "Entertainment", "בידור", "#E53935"),
  expenseCategory("gift-outline", "Gifts", "מתנות", "#8E24AA"),
];

const FEEDBACK_CATEGORIES = bilingual([
  ["Transactions", "עסקאות"],
  ["Wallet Balance", "יתרת ארנק"],
  ["Money Transfer", "העברת כספים"],
  ["Bill Payments", "תשלומי חשבונות"],
  ["Security", "אבטחה"],
  ["User Interface", "ממשק משתמש"],
  ["Other", "אחר"],
]);

const SUGGESTION_TYPES = bilingual([
  ["New Feature", "תכונה חדשה"],
  ["Improvement", "שיפור"],
  ["Design Enhancement", "שיפור עיצוב"],
  ["Performance", "ביצועים"],
  ["Other", "אחר"],
]);

const SUGGESTION_PRIORITY_LEVELS = bilingual([
  ["Nice to Have", "נחמד שיהיה"],
  ["Would Be Helpful", "יכול לעזור"],
  ["Very Important", "מאוד חשוב"],
  ["Critical", "קריטי"],
]);

const BUG_SEVERITIES = bilingual([
  ["Low - Minor Issue", "נמוך - בעיה מינורית"],
  ["Medium - Inconvenient", "בינוני - בעיה לא נוחה"],
  ["High - Major Problem", "גבוה - בעיה משמעותית"],
  ["Critical - App Unusable", "קריטי - האפליקציה לא שמישה"],
]);

const BUG_PLACES = bilingual([
  ["Login/Registration", "כניסה/הרשמה"],
  ["Dashboard", "לוח מחוונים"],
  ["Send Money", "שלח כסף"],
  ["Request Money", "בקשת כסף"],
  ["Transaction History", "היסטוריית עסקאות"],
  ["Bill Payments", "תשלומי חשבונות"],
  ["Cards/Accounts", "כרטיסים/חשבונות"],
  ["Settings", "הגדרות"],
  ["Other", "אחר"],
]);

const TRIP_COUNTRIES = [
  {
    name: { en: "Thailand", he: "תאילנד" },
    code: "TH",
    currencies: [{ code: "THB", name: { en: "Thai Baht", he: "בהט תאילנדי" } }],
  },
  {
    name: { en: "Philippines", he: "פיליפינים" },
    code: "PH",
    currencies: [{ code: "PHP", name: { en: "Philippine Peso", he: "פזו פיליפיני" } }],
  },
  {
    name: { en: "Vietnam", he: "ויאטנם" },
    code: "VN",
    currencies: [{ code: "VND", name: { en: "Vietnamese Dong", he: "דונג וייטנאמי" } }],
  },
  {
    name: { en: "Cambodia", he: "קמבודיה" },
    code: "KH",
    currencies: [
      { code: "KHR", name: { en: "Cambodian Riel", he: "ריאל קמבודי" } },
      { code: "USD", name: { en: "US Dollar", he: "דולר אמריקאי" } },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* Seeders                                                                    */
/* `destructive: true` means the seeder clears existing table data first.     */
/* -------------------------------------------------------------------------- */

const SEEDERS = {
  currency: {
    description: "Fetch and store the latest currency rates",
    run: logged("currency data", updateCurrencyRates),
  },

  deltaRate: {
    description: "Delta rate percentage setting",
    run: logged("delta rate percentage", () =>
      SettingsService.updateSettings("delta_percentage", DELTA_RATE_PERCENTAGE),
    ),
  },

  legal: {
    description: "Terms & conditions and privacy policy placeholders",
    run: logged("terms and privacy policy", async () => {
      await SettingsService.updateSettings("terms_and_conditions", TERMS_AND_CONDITIONS);
      await SettingsService.updateSettings("privacy_policy", PRIVACY_POLICY);
    }),
  },

  adminUser: {
    description: "Default admin user",
    run: logged("admin user", () => UserService.createDefaultAdminUser()),
  },

  defaultExpenses: {
    description: "Default expense categories",
    destructive: true,
    run: logged("default expense categories", async () => {
      await ExpensesCategoriesService.clearExpenseTable();
      for (const category of DEFAULT_EXPENSE_CATEGORIES) {
        await ExpensesCategoriesService.createExpense(category);
      }
    }),
  },

  feedbackCategories: {
    description: "Feedback categories",
    destructive: true,
    run: logged("feedback categories", async () => {
      await FeedbackService.clearFeedbackCategoryTable();
      await FeedbackService.addCategories(withTimestamps(FEEDBACK_CATEGORIES));
    }),
  },

  suggestionTypes: {
    description: "Suggestion types",
    destructive: true,
    run: logged("suggestion types", async () => {
      await SuggestionService.clearSuggestionTypeTable();
      await SuggestionService.addSuggestionType(withTimestamps(SUGGESTION_TYPES));
    }),
  },

  suggestionPriorityLevels: {
    description: "Suggestion priority levels",
    destructive: true,
    run: logged("suggestion priority levels", async () => {
      await SuggestionService.clearSuggestionPriorityLevelTable();
      await SuggestionService.addSuggestionPriorityLevels(
        withTimestamps(SUGGESTION_PRIORITY_LEVELS),
      );
    }),
  },

  bugSeverities: {
    description: "Bug severities",
    destructive: true,
    run: logged("bug severities", async () => {
      await BugReportService.clearBugSeverityTable();
      await BugReportService.addBugSeverity(withTimestamps(BUG_SEVERITIES));
    }),
  },

  bugPlaces: {
    description: "Bug places",
    destructive: true,
    run: logged("bug places", async () => {
      await BugReportService.clearBugPlaceTable();
      await BugReportService.addBugPlaces(withTimestamps(BUG_PLACES));
    }),
  },

  tripCountries: {
    description: "Supported trip countries and their currencies",
    run: logged("trip countries", async () => {
      for (const { name, code, currencies } of TRIP_COUNTRIES) {
        await SettingsService.createTripCountry(name, code, currencies);
      }
    }),
  },

  virtualDebitCardCharge: {
    description: "Virtual debit card charge percentage",
    run: logged("virtual debit card charge", () =>
      SettingsService.updateSettings(
        "virtual_debit_card_charge",
        VIRTUAL_DEBIT_CARD_CHARGE,
      ),
    ),
  },
  directBankTransferFees: {
    description: "Direct bank transfer fees",
    run: logged("direct bank transfer fees", () =>
      SettingsService.updateSettings(
        "direct_bank_transfer_fees",
        JSON.stringify(DIRECT_BANK_TRANSFER_FEES),
      ),
    ),
  },
};

/* -------------------------------------------------------------------------- */
/* CLI                                                                        */
/* -------------------------------------------------------------------------- */

const printUsage = () => {
  console.log(`
Usage:
  node seeder.js --list
  node seeder.js --only=<name>[,<name>...]
  node seeder.js --all
  node seeder.js ... --force   (required in production if a destructive seeder runs)

Seeders:`);
  for (const [name, { description, destructive }] of Object.entries(SEEDERS)) {
    console.log(
      `  ${name.padEnd(26)} ${description}${destructive ? "  [clears existing data]" : ""}`,
    );
  }
  console.log();
};

const main = async () => {
  const { values } = parseArgs({
    options: {
      list: { type: "boolean", default: false },
      all: { type: "boolean", default: false },
      only: { type: "string" },
      force: { type: "boolean", default: false },
    },
  });

  if (values.list || (!values.all && !values.only)) {
    printUsage();
    return 0;
  }

  const names = values.all
    ? Object.keys(SEEDERS)
    : values.only.split(",").map((n) => n.trim()).filter(Boolean);

  const unknown = names.filter((n) => !SEEDERS[n]);
  if (unknown.length) {
    console.error(`Unknown seeder(s): ${unknown.join(", ")}`);
    printUsage();
    return 1;
  }

  const destructive = names.filter((n) => SEEDERS[n].destructive);
  if (destructive.length && process.env.NODE_ENV === "production" && !values.force) {
    console.error(
      `Refusing to run destructive seeders in production without --force: ${destructive.join(", ")}`,
    );
    return 1;
  }

  const failures = [];
  for (const name of names) {
    const start = Date.now();
    try {
      await SEEDERS[name].run();
      console.log(`  ✔ ${name} (${Date.now() - start}ms)\n`);
    } catch (error) {
      console.error(`  ✖ ${name} failed:`, error);
      failures.push(name);
    }
  }

  if (failures.length) {
    console.error(`\n${failures.length} seeder(s) failed: ${failures.join(", ")}`);
    return 1;
  }
  console.log("All seeders completed successfully.");
  return 0;
};

main()
  .then((code) => process.exit(code))
  .catch((error) => {
    console.error("Seeder crashed:", error);
    process.exit(1);
  });