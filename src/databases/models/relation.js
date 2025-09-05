const relation = (db) => {
  const { User, UserCard, WalletPelePayment, WalletTransaction, UserWallet, ApiLogs, UserKyc, UserDevices, UserFcm, Transfer, Notification, TransferRequests, UserSettings } = db;

  //user saved cards
  User.hasMany(UserCard, { foreignKey: "userId", as : "cards" });
  UserCard.belongsTo(User, { foreignKey: "userId", as : "user" });

  //user saved pele payments
  User.hasMany(WalletPelePayment, { foreignKey: "userId", as: "walletPayments" });
  WalletPelePayment.belongsTo(User, { foreignKey: "userId", as: "user" });

  //user wallets
  User.hasMany(UserWallet, { foreignKey: "userId", as: "wallets" });
  UserWallet.belongsTo(User, { foreignKey: "userId", as: "user" });

  User.hasMany(ApiLogs, { foreignKey: "userId", as: "apiLogs" });
  ApiLogs.belongsTo(User, { foreignKey: "userId", as: "user" });

  User.hasOne(UserKyc, { foreignKey: "userId", as: "kyc" });
  UserKyc.belongsTo(User, { foreignKey: "userId", as: "user" });

  User.hasMany(UserDevices, { foreignKey: "userId", as: "devices" }); 
  UserDevices.belongsTo(User, { foreignKey: "userId", as: "user" });  

  User.hasMany(UserFcm, { foreignKey: "userId", as: "fcm" });
  UserFcm.belongsTo(User, { foreignKey: "userId", as: "user" }); 
  
  //WalletTransaction may belong to WalletPelePayment via paymentId (nullable)
  WalletPelePayment.hasOne(WalletTransaction, { foreignKey: "paymentId", as: "transaction" });
  WalletTransaction.belongsTo(WalletPelePayment, { foreignKey: "paymentId", as: "walletPayment" });

  User.hasMany(WalletTransaction, { foreignKey: "userId", as: "transactions" });
  WalletTransaction.belongsTo(User, { foreignKey: "userId", as: "user" });

  //user settings
  User.hasMany(UserSettings, { foreignKey: "userId", as: "settings" });
  UserSettings.belongsTo(User, { foreignKey: "userId", as: "user" });

  //Transfer model relations
  User.hasMany(Transfer, { foreignKey: "senderId", as: "sentTransfers" });
  User.hasMany(Transfer, { foreignKey: "receiverId", as: "receivedTransfers" });
  Transfer.belongsTo(User, { foreignKey: "senderId", as: "sender" });
  Transfer.belongsTo(User, { foreignKey: "receiverId", as: "receiver" });


  //TransferRequests model relations
  User.hasMany(TransferRequests, { foreignKey: "senderId", as: "sentTransferRequests" });
  User.hasMany(TransferRequests, { foreignKey: "receiverId", as: "receivedTransferRequests" });
  TransferRequests.belongsTo(User, { foreignKey: "senderId", as: "sender" });
  TransferRequests.belongsTo(User, { foreignKey: "receiverId", as: "receiver" });


  WalletTransaction.belongsTo(Transfer, { foreignKey: "transferId", as: "transfer" });
  Transfer.hasMany(WalletTransaction, { foreignKey: "transferId", as: "transactions" });


  WalletTransaction.belongsTo(TransferRequests, { foreignKey: "transferRequestId", as: "transferRequest" });
  TransferRequests.hasMany(WalletTransaction, { foreignKey: "transferRequestId", as: "transactions" });


  Notification.belongsTo(User, { foreignKey: "userId", as: "user" });
  User.hasMany(Notification, { foreignKey: "userId", as: "notifications" });

};

export default relation;
