import AirwallexPaymentService from "../services/airwallexPayment.service.js";

AirwallexPaymentService.chargeUserForDebitVirtualCardPayment(
  { id: 10 },
  (error, result) => {
    if (error) {
      console.error("Error:", error);
    } else {
      console.log("Result:", result);
    }
  }
);