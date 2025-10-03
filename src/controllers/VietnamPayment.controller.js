export default class VietnamPaymentController {

   static async ninePayIpn(request) {
     return {
            status: 200,
            data: {'received': true},
            message: "Successfully processed NinePay IPN",
            error: null,
          };
   }

}