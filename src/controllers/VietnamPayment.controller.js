import fs from "fs";
export default class VietnamPaymentController {
  static async ninePayIpn(request) {
    const {
      headers: { i18n, deviceLocation },
      user,
      payload,
    } = request;
    const logEntry = `${new Date().toISOString()} - ${JSON.stringify(payload)}\n`;
    fs.appendFile("callback-data.txt", logEntry, (err) => {
      if (err) {
        console.error("Error saving data:", err);
        return { status: 500, message: "Failed to save data" };
      }
      console.log("Data saved:", logEntry);
      return { status: 200, message: "Data received and saved" };
    });

    return {
      status: 200,
      data: { received: true },
      message: "Successfully processed NinePay IPN",
      error: null,
    };
  }
}
