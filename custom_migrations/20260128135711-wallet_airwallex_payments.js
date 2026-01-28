export async function up(queryInterface, Sequelize) {
  // TODO: create table
  await queryInterface.createTable(
    "wallet_airwallex_payments",
    {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      uuid: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      merchantOrderId:{
        type: Sequelize.TEXT,
        allowNull: true,
      },
      userId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      amount:{
        type: Sequelize.DECIMAL(20, 8),
        allowNull: true,
      },
      currency: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      capturedAmount:{
        type: Sequelize.DECIMAL(20, 8),
        allowNull: true,
      },
      descriptor: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      paymentId:{
        type: Sequelize.TEXT,
        allowNull: true,
      },
      originalAmount:{
        type: Sequelize.DECIMAL(20, 8),
        allowNull: true,
      },
      originalCurrency: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      webhookData: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "INITIATED",
      },
      latitude: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      longitude: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    },
    {
      supportsSearchPath: false,
    },
  );
}
export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("wallet_airwallex_payments", {
    supportsSearchPath: false,
  });
}
