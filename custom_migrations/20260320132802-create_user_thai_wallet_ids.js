export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("user_thai_wallet_ids", {
    id: {
      type: Sequelize.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: Sequelize.BIGINT,
      allowNull: false,
    },
    wallet_id: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    external_wallet_user_id: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
  },{
    supportsSearchPath: false,
  });
  await queryInterface.addIndex("user_thai_wallet_ids", ["user_id"], {
    name: "user_thai_wallet_ids_user_id_idx",
    unique: false,
    supportsSearchPath: false,
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeIndex("user_thai_wallet_ids", "user_thai_wallet_ids_user_id_idx", { supportsSearchPath: false });
  await queryInterface.dropTable("user_thai_wallet_ids",{supportsSearchPath: false});
}
