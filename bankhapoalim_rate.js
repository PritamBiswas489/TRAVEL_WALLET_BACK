import cron from 'node-cron';
import { chromium } from 'playwright';
import process from 'process';
import CurrencyService from './src/services/currency.service.js';
import * as Sentry from '@sentry/node';
import './src/config/environment.js';

// Main logic
async function getExchangeRate(currencyCode = "THB", amount = "10000") {
  const browser = await chromium.launch({ headless: true });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  });

  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    window.chrome = { runtime: {} };
    Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4] });
  });

  const page = await context.newPage();
  await page.addInitScript(`Object.defineProperty(navigator, 'webdriver', {get: () => undefined})`);

  console.log(`🔄 Fetching exchange rate for ${currencyCode} with amount ${amount}`);

  try {
    await page.goto("https://terminal.public.bankhapoalim.co.il/ng-portals/terminal/he/order", {
      waitUntil: "domcontentloaded",
      timeout: 30000
    });

    await page.waitForSelector("#currencies-select-0", { state: "visible", timeout: 10000 });
    await page.click("#currencies-select-0");

    const currencySelector = `text=${currencyCode} -`;
    await page.waitForSelector(currencySelector, { state: "visible", timeout: 5000 });
    await page.click(currencySelector);

    await page.waitForSelector("#event-amount", { timeout: 5000 });
    await page.fill("#event-amount", amount);

    await page.waitForSelector('#amount-currency >> text=₪', { timeout: 7000 });
    const resultText = await page.innerText("#amount-currency");

    const match = resultText.match(/שַׁעַר\s+([\d.]+)/);
    await browser.close();

    if (match) {
      const exchangeRate = parseFloat(match[1]);
      const inverseRate = 1 / exchangeRate;
      return {
        [`${currencyCode}_TO_ILS`]: exchangeRate,
        [`ILS_TO_${currencyCode}`]: Number(inverseRate.toFixed(6)),
        success: true,
      };
    } else {
      return {
        error: "Exchange rate not found",
        raw_text: resultText
      };
    }
  } catch (err) {
    await browser.close();
    return { error: err.message };
  }
}

// Scheduler using node-cron
cron.schedule('*/5 * * * *', async () => {
  console.log(`\n⏰ [${new Date().toISOString()}] Running scheduled currency update...`);

  const currencyCode = "THB";
  const amount = "10000";

  try {
    const result = await getExchangeRate(currencyCode, amount);

    if (result?.success) {
      const insertOrUpdateResult = await CurrencyService.bankhapoalimExchangeRateUpdate({
        [`${currencyCode}_TO_ILS`]: result[`${currencyCode}_TO_ILS`],
        [`ILS_TO_${currencyCode}`]: result[`ILS_TO_${currencyCode}`],
      });

      if (insertOrUpdateResult?.ERROR) {
        console.error("❌ Error updating currency:", insertOrUpdateResult.ERROR);
        process.env.SENTRY_ENABLED === "true" && Sentry.captureException(insertOrUpdateResult.ERROR);
      } else {
        console.log("✅ Currency updated successfully:", { insertOrUpdateResult, result });
      }
    } else {
      console.error("❌ Failed to fetch exchange rate:", result?.error || result);
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(result?.error || result);
    }

  } catch (err) {
    console.error("❌ Unexpected error:", err.message || err);
    process.env.SENTRY_ENABLED === "true" && Sentry.captureException(err);
  }
});

console.log("✅ Bank Hapoalim scheduler is running with node-cron. Waiting for 1 AM...");
