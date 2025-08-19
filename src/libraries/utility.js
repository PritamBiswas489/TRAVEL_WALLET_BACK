import handlebars from 'handlebars';
import fs from 'fs';
import moment from "moment-timezone";
import "../config/environment.js";
import crypto from 'crypto';

export const slugify = (str) =>
	str
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, '')
		.replace(/[\s_-]+/g, '-')
		.replace(/^-+|-+$/g, '');

export const generateHtmlTemplate = async (filePath, replacements) => {
	const source = fs.readFileSync(filePath, 'utf-8').toString();
	const template = handlebars.compile(source);
	const htmlToSend = template(replacements);
	return htmlToSend;
};

export const generateOtp = (digits = 6) => {
	var digits = '0123456789';
	let OTP = '';
	for (let i = 0; i < 4; i++) {
		OTP += digits[Math.floor(Math.random() * 10)];
	}
	return OTP;
};

export const generatePusherChannel = (userId1, userId2) => {
	const ids = [userId1, userId2];
	const sortedId = ids.sort();
	return `presence-channel-${sortedId[0]}-${sortedId[1]}`;
};

export function getRandomChar(characters) {
	const randomIndex = Math.floor(Math.random() * characters.length);
	return characters.charAt(randomIndex);
}
export function generateRandomPassword() {
	const length = 8;
	const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
	const numberChars = '0123456789';
	const specialChars = '!@#$%^&*()_-+=<>?';
  
	const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars;
  
	let password = '';
	
	// Ensure at least one character from each category
	password += getRandomChar(uppercaseChars);
	password += getRandomChar(lowercaseChars);
	password += getRandomChar(numberChars);
	password += getRandomChar(specialChars);
  
	// Fill the remaining length with random characters
	for (let i = password.length; i < length; i++) {
	  password += getRandomChar(allChars);
	}
  
	// Shuffle the password to randomize the order
	password = password.split('').sort(() => Math.random() - 0.5).join('');
  
	return password;
  }

  export function getPeleCardCurrencyNumber(){
	const currencyMap = {
		USD: 2,
		EUR: 978,
		ILS: 1
	};
	return currencyMap;
  }

  export function amountUptotwoDecimalPlaces(amount) {
	return parseFloat(amount.toFixed(2));
  }

  export function formatDateToTimezone(date) {
    return moment.utc(date).tz(process.env.TIMEZONE).format("YYYY-MM-DD HH:mm:ss");
  }

  export const handleCallback = (err, result, callback) => {
      if (typeof callback === 'function') {
        return callback(err, result);
      } else if (err) {
        throw err;
      } else {
        return result;
      }
};
export const getcurrencySymbols = (Code) => {
  const currencySymbols = {
    USD: "$",
    EUR: "€",
    ILS: "₪",
	THB: "฿",
  };
  return currencySymbols[Code] || "";
}


export function randomSaltHex(bytes = 16) {
  return crypto.randomBytes(bytes).toString('hex'); // 32 hex chars
}

export function createHmacExecute(data, secret) {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}