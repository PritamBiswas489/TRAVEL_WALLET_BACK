import AirwallexPaymentService from "../services/airwallexPayment.service.js";

// AirwallexPaymentService.chargeUserForDebitVirtualCardPayment(
//   { id: 10 },
//   (error, result) => {
//     if (error) {
//       console.error("Error:", error);
//     } else {
//       console.log("Result:", result);
//     }
//   }
// );
import UserService from "../services/user.service.js";
console.log(await AirwallexPaymentService.getAccountBalance({ userId: 19 , i18n: null},()=>{}));