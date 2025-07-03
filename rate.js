import { chromium } from 'playwright';
import process from 'process';

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
 console.log(`Fetching exchange rate for ${currencyCode} with amount ${amount}`);
  try {
    await page.goto("https://terminal.public.bankhapoalim.co.il/ng-portals/terminal/he/order", { waitUntil: "domcontentloaded" });

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
        exchange_rate: exchangeRate,
        inverse_rate: Number(inverseRate.toFixed(6)),
        raw_text: resultText,
        tt: 1
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

// CLI usage
(async () => {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log("Usage: node rate.js <currency_code> <amount>");
    process.exit(1);
  }

  const currencyCode = args[0];
  const amount = args[1];

  const result = await getExchangeRate(currencyCode, amount);
  console.log(result);
})();
