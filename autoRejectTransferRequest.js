import TransferRequestService from "./src/services/transferRequest.service.js";
import i18n from "./src/config/i18.config.js";
import UserService from "./src/services/user.service.js";
import cron from "node-cron";
import CronTrackService from "./src/services/crontrack.service.js";
const autoRejectTransferRequest = async () => {
  console.log(
    "//========== start auto reject transfer =======================//"
  );
  try {
    const getTransfersMoreThan24Hours =
      await TransferRequestService.getExpiredTransferRequests();
    //  console.log("getTransfersMoreThan24Hours", getTransfersMoreThan24Hours.length)
    if (getTransfersMoreThan24Hours.length > 0) {
      for (const transfer of getTransfersMoreThan24Hours) {
        console.log("Processing transfer:", transfer.id);
        const user = await UserService.getUserById(transfer.receiverId);
        i18n.setLocale(user?.lang || "en");
        const rejectTransfer = await new Promise((resolve, reject) => {
          TransferRequestService.acceptRejectTransferRequest(
            {
              transferRequestId: transfer.id,
              userId: transfer.receiverId,
              status: "rejected",
              i18n,
              autoRejected: true,
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          );
        });
        console.log("Transfer request rejected:", rejectTransfer);
      }
    }
  } catch (error) {
    console.error("Error occurred while getting expired transfer requests:", error);
  }
};

cron.schedule(
    "*/25 * * * *", // Run every 25 minutes
    async () => {
        console.log("[Cron] ⏰ Running scheduled job every 25 minutes...");
        await autoRejectTransferRequest();
        await CronTrackService.addCronTrack("autoRejectTransferRequest");
    },
    {
        scheduled: true,
        timezone: process.env.TIMEZONE || "Asia/Bangkok",
    }
);

