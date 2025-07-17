import admin from "../config/firebaseAdmin.js";
import UserService from "./user.service.js";

export default class PushNotificationService {
  static async sendNotification({ userId, title, body, data  }, callback) {
    console.log(data);
    try {
      const user = await UserService.getUserDetails(userId);
      // console.log(user);
      if (!user || !user?.fcm?.fcmToken) {
        return callback(new Error("User or FCM token not found"));
      }
      const token = user.fcm.fcmToken;
      const message = {
        notification: {
          title: title,
          body: body,
        },
        token: token,
        data,
      };
      const response = await admin.messaging().send(message);
      console.log("Successfully sent message:", response);
      return callback(null, { messageId: response, token });
    } catch (error) {
      console.error("Error sending message:", error);
      return callback(error);
    }
  }
}
