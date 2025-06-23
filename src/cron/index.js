import CurrencyService from "../services/currency.service.js";
// cronJob.js
import cron from 'node-cron';

// Your scheduled task
const updateCurrencyRates = async () => {
    console.log('Cron Job Running at 1 AM:', new Date().toLocaleString());
    try {
        await CurrencyService.insertOrUpdateCurrency();
        console.log('Currency rates updated successfully');
    } catch (error) {
        console.error('Error updating currency rates:', error);
    }
};

// Schedule the task to run every day at 1 AM
cron.schedule('0 1 * * *', () => {
    updateCurrencyRates();
}, {
    scheduled: true,
    timezone: 'Asia/Jerusalem'  // Set your timezone if needed
});
console.log('Cron job scheduled to run every day at 1 AM');
