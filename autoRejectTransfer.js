
import TransferService from "./src/services/transfer.service.js";
import i18n from "./src/config/i18.config.js";
import UserService from "./src/services/user.service.js";
import cron from "node-cron";
const autoRejectTransfer = async () => {
  console.log("//========== start auto reject transfer =======================//")
  try{
    const getTransfersMoreThan24Hours = await TransferService.getExpiredTransfers()
    //  console.log("getTransfersMoreThan24Hours", getTransfersMoreThan24Hours.length)
    if(getTransfersMoreThan24Hours.length > 0){
      for (const transfer of getTransfersMoreThan24Hours) {
        console.log("Processing transfer:", transfer.id)
        const user = await UserService.getUserById(transfer.receiverId);
        i18n.setLocale(user?.lang || 'en');
        const rejectTransfer = await new Promise((resolve, reject) => {
            TransferService.acceptRejectTransfer({
                transferId: transfer.id,
                userId:transfer.receiverId,
                status: "rejected",
                i18n,
                autoRejected: true
            },(error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        })
        console.log("Transfer rejected:", rejectTransfer);
      }
    }
  } catch (error) {
       console.error("Error occurred while getting expired transfers:", error);
  }
}
// autoRejectTransfer();
cron.schedule(
    "*/20 * * * *", // Run every 20 minutes
    async () => {
        console.log("[Cron] ⏰ Running scheduled job every 20 minutes...");
        await autoRejectTransfer();
    },
    {
        scheduled: true,
        timezone: process.env.TIMEZONE || "Asia/Bangkok",
    }
);
