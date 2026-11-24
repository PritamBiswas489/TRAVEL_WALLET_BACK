import AirwallexPaymentService from "../services/airwallexPayment.service.js";
const accessToken = await AirwallexPaymentService.getAirWalletxToken();

const command = `curl --request GET \
  --url 'https://api.sandbox.airwallex.com/api/v1/beneficiaries' \
  --header 'Authorization: Bearer ${accessToken}' \
  --header 'Content-Type: application/json' \
  --header 'x-on-behalf-of: acct_l3ypi9rbM7i8qzOrowy4Mg' \
}'`

console.log(command);