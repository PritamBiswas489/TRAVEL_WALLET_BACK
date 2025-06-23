const relation = (db) => {
  const { User, UserCard } = db;

  User.hasMany(UserCard, { foreignKey: "userId", as : "cards" });
  UserCard.belongsTo(User, { foreignKey: "userId", as : "user" });
};

export default relation;
