/**
 * HMAC-SHA512 Request Signature Utility
 * Optional enhanced security per PPXC API spec (Section: Request Signature)
 * Signature is base64-encoded HMAC-SHA512 of JSON.stringify(requestBody)
 */

import { createHmac } from "crypto";

/**
 * Generate HMAC-SHA512 signature for a request body
 * @param {object} requestBody - The JSON request body object
 * @param {string} secretKey   - Shared secret (from IPPS coordinator)
 * @returns {string} base64-encoded signature
 */
export function generateSignature(requestBody, secretKey) {
  if (!secretKey) throw new Error("Shared secret is required for signature generation");
  const payload = JSON.stringify(requestBody);
  const hmac = createHmac("sha512", secretKey);
  hmac.update(payload);
  return hmac.digest("base64");
}

/**
 * Build complete request headers for PPXC API
 * @param {string} apiKey      - Partner API key
 * @param {object} [body]      - Request body (for signature, optional)
 * @param {string} [secretKey] - Shared secret (optional, for signature)
 * @returns {object} headers object
 */
export function buildHeaders(apiKey, body = null, secretKey = null) {
  const headers = {
    "x-api-key": apiKey,
    "Content-Type": "application/json",
  };

  if (body && secretKey) {
    headers["x-signature"] = generateSignature(body, secretKey);
  }

  return headers;
}
