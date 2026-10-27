import AirwallexPaymentService from "../services/airwallexPayment.service.js";
import dotenv from "dotenv";
dotenv.config();
const airwallexAccountId = "acct_kwyVAd8AMhWkA6jIGk3P_Q";
const accessToken = await AirwallexPaymentService.getAirWalletxToken();
console.log(`Curl command for offboarding request: curl -X POST "${process.env.AIRWALLEX_API_URL}/api/v1/accounts/${encodeURIComponent(airwallexAccountId)}/offboardings/create" -H "Authorization: Bearer ${accessToken}" -H "Content-Type: application/json" -d '{"comment":"Account no longer needed","reason_code":"OTHER"}'`);