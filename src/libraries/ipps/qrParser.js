/**
 * Thai QR Code TLV Parser
 * Parses EMVCo-compliant Thai PromptPay QR codes (Tag 29 / Tag 30)
 * Specification: EMVCo QR Code Spec + Thailand PromptPay/Bill Payment conventions
 */

import { validateQRCRC } from "./crc.js";

// ─────────────────────────────────────────────────────────────────────────────
// TLV PARSER CORE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parse a TLV-encoded string into an array of {tag, length, value} objects
 * Parsing is performed left→right without skipping bytes
 * @param {string} tlvString
 * @returns {Array<{tag: string, length: number, value: string}>}
 */
export function parseTLV(tlvString) {
  const result = [];
  let pos = 0;

  while (pos < tlvString.length) {
    if (pos + 4 > tlvString.length) break; // need at least tag(2) + length(2)

    const tag = tlvString.substring(pos, pos + 2);
    const lengthStr = tlvString.substring(pos + 2, pos + 4);
    const length = parseInt(lengthStr, 10);

    if (isNaN(length)) break;

    const valueStart = pos + 4;
    const valueEnd = valueStart + length;

    if (valueEnd > tlvString.length) break;

    const value = tlvString.substring(valueStart, valueEnd);
    result.push({ tag, length, value });

    pos = valueEnd;
  }

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// RECEIVER PROXY TYPE CLASSIFICATION  (Section 7 of doc)
// ─────────────────────────────────────────────────────────────────────────────

const PROMPTPAY_MSISDN_PREFIX = "0066"; // international mobile prefix
const BILLER_AID = "A000000677010112";    // PromptPay Bill Payment AID

/**
 * Determine receiverProxyType based on parsed QR context
 * Rule: if bill references OR biller name exist → BILLERID
 * @param {object} ctx - parsed context object
 * @returns {string} BILLERID | MSISDN | NATID | EWALLETID | BANKAC
 */
function determineReceiverProxyType(ctx) {
  // BILLERID indicators (Section 7.3)
  if (ctx.hasBillerName)       return "BILLERID";
  if (ctx.billReference1)      return "BILLERID";
  if (ctx.isDynamicQR)         return "BILLERID";
  if (ctx.isBillPaymentAID)    return "BILLERID";

  // Wallet / P2P (Section 7.4)
  const v = ctx.receiverProxyValue || "";
  if (!v) return "UNKNOWN";

  if (v.length === 10 && (v.startsWith("06") || v.startsWith("08") || v.startsWith("09"))) {
    return "MSISDN"; // Thai mobile: 06x, 08x, 09x
  }
  if (v.length === 13 && /^\d+$/.test(v)) {
    return "NATID"; // Thai national ID
  }
  if (v.length === 15) {
    return "EWALLETID"; // 15-digit e-wallet
  }

  return "MSISDN"; // fallback
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PARSER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parse a raw Thai QR payload string and extract all API-ready parameters
 *
 * @param {string} rawQR - Raw QR code string from scanner
 * @returns {{
 *   valid: boolean,
 *   qrType: "TAG29" | "TAG30" | "UNKNOWN",
 *   receiverProxyType: string,
 *   receiverProxyValue: string,
 *   billReference1: string | null,
 *   billReference2: string | null,
 *   billReference3: string | null,
 *   amount: number | null,
 *   currency: string,
 *   country: string,
 *   receiverBillerAccountName: string | null,
 *   isDynamicQR: boolean,
 *   crcValid: boolean,
 *   raw: object,
 *   error: string | null
 * }}
 */
export function parseThaiQR(rawQR) {
  if (!rawQR || typeof rawQR !== "string") {
    return { valid: false, error: "Empty or invalid QR string" };
  }

  const qr = rawQR.trim();

  // Step 1: Validate CRC (mandatory per spec)
  const crcResult = validateQRCRC(qr);
  if (!crcResult.valid) {
    console.warn(`[QR Parser] CRC mismatch — expected ${crcResult.expected}, found ${crcResult.found}`);
  }

  // Step 2: Parse top-level TLV
  const topLevel = parseTLV(qr);
  const tlvMap = {};
  for (const item of topLevel) {
    tlvMap[item.tag] = item;
  }

  // Step 3: Determine dynamic/static QR
  // Tag 01: "11" = static, "12" = dynamic
  const initiationMode = tlvMap["01"]?.value;
  const isDynamicQR = initiationMode === "12";

  // Step 4: Decode Tag 29 / Tag 30 merchant account info
  let merchantAccountInfo = null;
  let qrType = "UNKNOWN";

  // Priority: check Tag 30 first (Bill Payment, most common)
  if (tlvMap["30"]) {
    merchantAccountInfo = parseTLV(tlvMap["30"].value);
    qrType = "TAG30";
  } else if (tlvMap["29"]) {
    merchantAccountInfo = parseTLV(tlvMap["29"].value);
    qrType = "TAG29";
  } else {
    // Scan tags 26–51 for any merchant account info slot
    for (let t = 26; t <= 51; t++) {
      const tag = t.toString().padStart(2, "0");
      if (tlvMap[tag]) {
        merchantAccountInfo = parseTLV(tlvMap[tag].value);
        qrType = t === 29 ? "TAG29" : t === 30 ? "TAG30" : `TAG${t}`;
        break;
      }
    }
  }

  if (!merchantAccountInfo) {
    return { valid: false, qrType, crcValid: crcResult.valid, error: "No merchant account info found (Tag 29/30)" };
  }
  // console.log("Top-Level TLV Map:", tlvMap["29"].value);
  // console.log("Merchant Account Info:", merchantAccountInfo);

  // Step 5: Extract sub-tags from merchant account info
  const subMap = {};
  for (const item of merchantAccountInfo) {
    subMap[item.tag] = item;
  }
  console.log("Merchant Account Info Sub-Tags:", subMap);

  const aid              = subMap["00"]?.value || "";            // AID
  const receiverProxyValue =
  subMap["01"]?.value ||   // MSISDN
  subMap["02"]?.value ||   // NATID
  subMap["03"]?.value ||   // EWALLETID
  "";        // Proxy value
  const billReference1   = subMap["02"]?.value || null;          // Bill ref 1
  const billReference2   = subMap["03"]?.value || null;          // Bill ref 2

  // Step 6: Extract other top-level tags
  const amountStr  = tlvMap["54"]?.value;                        // Tag 54: Amount
  const currency   = tlvMap["53"]?.value || "764";               // Tag 53: Currency (764 = THB)
  const country    = tlvMap["58"]?.value || "TH";                // Tag 58: Country
  const billerName = tlvMap["59"]?.value || null;                // Tag 59: Biller/receiver name

  const amount = amountStr ? parseFloat(amountStr) : null;

  // Step 7: Build context and determine proxy type
  const ctx = {
    hasBillerName:   !!billerName,
    billReference1,
    isDynamicQR,
    isBillPaymentAID: aid === BILLER_AID,
    receiverProxyValue,
  };

  const receiverProxyType = determineReceiverProxyType(ctx);

  return {
    valid:                   true,
    qrType,                          // "TAG29" | "TAG30"
    receiverProxyType,               // "BILLERID" | "MSISDN" | "NATID" | "EWALLETID"
    receiverProxyValue,              // biller ID / mobile / national ID / e-wallet ID
    billReference1,                  // required for BILLERID
    billReference2,                  // optional
    billReference3:         null,    // sub-tag 04 if present (not common)
    amount,                          // fixed amount from QR, null = user-entered
    currency,
    country,
    receiverBillerAccountName: billerName,
    isDynamicQR,
    crcValid: crcResult.valid,
    aid,
    raw: { topLevel: tlvMap, merchantSubTags: subMap },
    error: null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// MAP QR → PPXC API PARAMS  (Section 8 of doc)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Map parsed QR data to PPXC /wallet-transfer/query request body
 * @param {object} parsed   - result of parseThaiQR()
 * @param {string} walletId - sender's 15-digit wallet ID
 * @param {number} [overrideAmount] - required if parsed.amount is null
 * @returns {object} request body for POST /wallet-transfer/query
 */
export function mapQRToQueryParams(parsed, walletId, overrideAmount = null) {
  if (!parsed.valid) throw new Error(`Invalid QR: ${parsed.error}`);

  const amount = parsed.amount ?? overrideAmount;
  if (!amount || amount <= 0) throw new Error("Amount is required (not present in QR)");

  const body = {
    walletId,
    amount,
    receiverType:  parsed.receiverProxyType,
    receiverValue: parsed.receiverProxyValue,
  };

  // Bill payment extras
  if (parsed.receiverProxyType === "BILLERID") {
    body.billReference1 = parsed.billReference1 || "";
    body.billReference2 = parsed.billReference2 || "";
    body.billReference3 = parsed.billReference3 || "";
  }

  return body;
}
