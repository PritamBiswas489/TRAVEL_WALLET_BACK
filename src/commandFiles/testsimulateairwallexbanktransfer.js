// npm install axios
 
import axios from "axios";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();


const BASE_URL =  process.env.AIRWALLEX_API_URL;
const CLIENT_ID = process.env.AIRWALLEX_CLIENT_ID;       // your PLATFORM credentials
const API_KEY = process.env.AIRWALLEX_API_KEY;
const   accountId = process.env.AIRWALLEX_ACCOUNT_ID;



const api = axios.create({ baseURL: BASE_URL, timeout: 30000 });

const uuid = () => crypto.randomUUID();
const log = (title, data) =>
  console.log(`\n===== ${title} =====\n`, JSON.stringify(data, null, 2));

// ---------------------------------------------------------------------------
// 1. Get access token (use your PLATFORM Client ID + API key)
// ---------------------------------------------------------------------------
async function getAccessToken() {
  const { data } = await api.post("/api/v1/authentication/login", null, {
    headers: {
      "x-client-id": CLIENT_ID,
      "x-api-key": API_KEY,
      "x-login-as": accountId,
    },
  });
  return data.token;
}


// ---------------------------------------------------------------------------
// 4. Create + confirm bank transfer PaymentIntent on behalf of the CA
// ---------------------------------------------------------------------------
async function createBankTransferIntent(token, connectedAccountId) {
    try {
        console.log("Creating bank transfer intent with token:", token);
    console.log("Creating bank transfer intent for connected account:", connectedAccountId);
  const { data } = await api.post(
    "/api/v1/pa/payment_intents/create",
    {
      request_id: uuid(),
      merchant_order_id: `order-${Date.now()}`,
      amount: 100,
      currency: "ILS",
      payment_method_options: { bank_transfer: {} },
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        // "x-on-behalf-of": connectedAccountId,
      },
    }
  );
  console.log("Created bank transfer intent:", data);
  return data;
}catch (error) {
    console.error("Error creating bank transfer intent:", error.response?.data || error.message);
  }
}

async function confirmIntent(token, connectedAccountId, intentId) {
  const { data } = await api.post(
    `/api/v1/pa/payment_intents/${intentId}/confirm`,
    {
      request_id: uuid(),
      payment_method: { type: "bank_transfer" },
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "x-on-behalf-of": connectedAccountId,
      },
    }
  );
  return data;
}

// ---------------------------------------------------------------------------
// 5. Simulate the shopper's bank transfer (sandbox test simulator)
// ---------------------------------------------------------------------------
async function simulateTransfer(token, connectedAccountId, instructions) {
  const { data } = await api.post(
    "/api/v1/simulation/pa/shopper_actions/transfer",
    {
      // Use account_number + reference from the transfer instructions
      // returned by the confirmed PaymentIntent (next_action.url / response)
      account_number: instructions.account_number, // e.g. "E1D5C0E9CB"
      amount: "100",
      reference: instructions.reference, // e.g. "D5NCUC"
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "x-on-behalf-of": connectedAccountId,
      },
    }
  );
  return data;
}

// ---------------------------------------------------------------------------
// 6. Check the connected account's wallet balance
// ---------------------------------------------------------------------------
async function getBalance(token, connectedAccountId) {
  const { data } = await api.get("/api/v1/balances/current", {
    headers: {
      Authorization: `Bearer ${token}`,
      "x-on-behalf-of": connectedAccountId,
    },
  });
  return data;
}

// ---------------------------------------------------------------------------
// 7. Poll PaymentIntent until it moves to SUCCEEDED
// ---------------------------------------------------------------------------
async function getIntent(token, connectedAccountId, intentId) {
  const { data } = await api.get(
    `/api/v1/pa/payment_intents/${intentId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-on-behalf-of": connectedAccountId,
      },
    }
  );
  return data;
}

async function waitForStatus(token, caId, intentId, status = "SUCCEEDED", tries = 20) {
  for (let i = 0; i < tries; i++) {
    const intent = await getIntent(token, caId, intentId);
    console.log(`  attempt ${i + 1}: status=${intent.status}`);
    if (intent.status === status) return intent;
    await new Promise((r) => setTimeout(r, 3000));
  }
  throw new Error("Timed out waiting for PaymentIntent status");
}

// ---------------------------------------------------------------------------
// MAIN
// ---------------------------------------------------------------------------
(async () => {
  const token = await getAccessToken();
  log("Access token obtained (truncated)", token.slice(0, 20) + "...");

 
 const account = {
    "id":  "acct_ulyV55NqMpqr1NY36HUG_w",
 }

  // Step 3: create the bank transfer PaymentIntent on behalf of the CA
  const intent = await createBankTransferIntent(token, account.id);
  log("PaymentIntent created", { id: intent.id, status: intent.status });
  
 

  // Step 4: confirm it — response contains transfer instructions
  const confirmed = await confirmIntent(token, account.id, intent.id);
  log("PaymentIntent confirmed", {
    id: confirmed.id,
    status: confirmed.status,
  });

  // Extract transfer instructions (adjust paths to the actual response)
  const attempt = confirmed.latest_payment_attempt;
  const bankTransfer = attempt?.payment_method?.bank_transfer ?? {};
  const instructions = {
    account_number: bankTransfer.account_number,
    reference: bankTransfer.reference,
  };
  log("Transfer instructions", instructions);

  // Step 5: simulate the shopper sending the funds
  await simulateTransfer(token, account.id, instructions);
  log("Bank transfer simulated", { amount: 100 });

  // Step 6: wait for the payment to succeed
  const finalIntent = await waitForStatus(token, account.id, intent.id);
  log("Final PaymentIntent", {
    id: finalIntent.id,
    status: finalIntent.status,
    captured_amount: finalIntent.captured_amount,
  });

  // Step 7: check the connected account balance
  // NOTE: bank transfer settlement is T+1 by default, so the balance
  // may not reflect the funds immediately after the intent succeeds.
  const balance = await getBalance(token, account.id);
  log("Connected account balance", balance);
})().catch((err) => {
  console.error("\nERROR:", err.response?.data || err.message);
});