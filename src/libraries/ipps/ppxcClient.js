/**
 * PPXC API Client
 * Wraps all IPPS PPXC REST API calls with proper auth, error handling, and retry logic
 */

import fetch from "node-fetch";
import { buildHeaders } from "./signature.js";
import "../../config/environment.js";

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URLS = {
  sit:        "https://promptpay-api-sit.ipps.cloud",
  production: process.env.PPXC_PROD_URL || "",
};

const ENV       = process.env.PPXC_ENV;
const BASE_URL  = BASE_URLS[ENV];
const API_KEY   = process.env.PPXC_API_KEY || "";
const SECRET    = process.env.PPXC_SHARED_SECRET || "";

// ─────────────────────────────────────────────────────────────────────────────
// RETRY LOGIC (exponential backoff, max 3 retries)
// Per spec: retry 502, 503, 504. Don't retry 4xx.
// ─────────────────────────────────────────────────────────────────────────────

async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      if (err.statusCode && err.statusCode < 500) throw err; // Don't retry 4xx
      const delay = Math.min(1000 * Math.pow(2, i), 10000);
      console.warn(`[PPXC] Retry ${i + 1}/${maxRetries} in ${delay}ms — ${err.message}`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// BASE REQUEST
// ─────────────────────────────────────────────────────────────────────────────

async function ppxcRequest(method, path, body = null) {
  const url = `${BASE_URL}${path}`;
  console.log("Sending PPXC request:", url);
  const headers = buildHeaders(API_KEY, body, SECRET || null);

  const options = {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  };

  const response = await fetch(url, options);
  const text = await response.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { message: text };
  }

  if (!response.ok) {
    const err = new Error(data?.message || `HTTP ${response.status}`);
    err.statusCode = response.status;
    err.details = data;
    throw err;
  }

  return data;
}

// ─────────────────────────────────────────────────────────────────────────────
// WALLET MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Register a new wallet user
 * POST /register-wallet-user
 * @param {object} params
 * @returns {{ walletId: string }}
 */
export async function registerWallet(params) {
  return retryWithBackoff(() => ppxcRequest("POST", "/register-wallet-user", params));
}

/**
 * Deactivate an existing wallet user
 * POST /deactivate-wallet-user
 * @param {string} externalWalletUserId
 * @returns {null} 204 No Content
 */
export async function deactivateWallet(externalWalletUserId) {
  return retryWithBackoff(() =>
    ppxcRequest("POST", "/deactivate-wallet-user", { externalWalletUserId })
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FUND-OUT / PAY-OUT OPERATIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Transfer Query (Lookup) — Step 1 of payment flow
 * POST /wallet-transfer/query
 *
 * Supports all receiver types:
 *   BANKAC   → { walletId, amount, receiverType:"BANKAC", receiverValue, receiverBank }
 *   MSISDN   → { walletId, amount, receiverType:"MSISDN", receiverValue }
 *   NATID    → { walletId, amount, receiverType:"NATID",  receiverValue }
 *   EWALLETID→ { walletId, amount, receiverType:"EWALLETID", receiverValue }
 *   BILLERID → { walletId, amount, receiverType:"BILLERID", receiverValue,
 *                billReference1, billReference2?, billReference3? }
 *
 * @returns {{ lookupRef, receiverName, receiverDisplayName, fee }}
 */
export async function transferQuery(params) {
  return retryWithBackoff(() => ppxcRequest("POST", "/wallet-transfer/query", params));
}

/**
 * Transfer Confirmation — Step 2 of payment flow
 * POST /wallet-transfer/confirm
 *
 * Must include all query params + lookupRef + receiverBank
 *
 * @returns {{ success, message, walletCode, timestamp, data: { code, responseId, ... } }}
 */
export async function transferConfirm(params) {
  // receiverBank is required for ALL receiver types in confirm step
  return retryWithBackoff(() => ppxcRequest("POST", "/wallet-transfer/confirm", params));
}

/**
 * Transaction Inquiry — Optional Step 3 (reconciliation)
 * POST /wallet-transfer/inquiry
 * @param {string} inquiryRqUID - from confirm response data.rqUID
 * @returns {{ status, amount, feeAmount, timestamp }}
 */
export async function transferInquiry(inquiryRqUID) {
  return retryWithBackoff(() =>
    ppxcRequest("POST", "/wallet-transfer/inquiry", { inquiryRqUID })
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PARTNER BALANCE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get current partner balance
 * GET /partners/:partnerId/balance
 * @param {string} partnerId
 * @returns {{ partnerId, mainBalance, feeBalance, currency, lastUpdated }}
 */
export async function getPartnerBalance(partnerId) {
  return retryWithBackoff(() =>
    ppxcRequest("GET", `/partners/${partnerId}/balance`)
  );
}
