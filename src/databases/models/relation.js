const relation = (db) => {
  const { User, UserCard, WalletPelePayment, UserWallet } = db;

  //user saved cards
  User.hasMany(UserCard, { foreignKey: "userId", as : "cards" });
  UserCard.belongsTo(User, { foreignKey: "userId", as : "user" });

  //user saved pele payments
  User.hasMany(WalletPelePayment, { foreignKey: "userId", as: "walletPayments" });
  WalletPelePayment.belongsTo(User, { foreignKey: "userId", as: "user" });

  //user wallets
  User.hasOne(UserWallet, { foreignKey: "userId", as: "wallets" });
  UserWallet.belongsTo(User, { foreignKey: "userId", as: "user" });

};

export default relation;
