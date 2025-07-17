export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable(
    "wallet_pele_payments",
    {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      StatusCode: Sequelize.STRING,
      EnStatusMessage: Sequelize.STRING,
      HeStatusMessage: Sequelize.STRING,
      PelecardTransactionId: Sequelize.STRING,
      VoucherId: Sequelize.STRING,
      ShvaResult: Sequelize.STRING,
      ShvaResultEmv: Sequelize.STRING,
      ShvaResultEmvMessage: Sequelize.STRING,
      ShvaFileNumber: Sequelize.STRING,
      StationNumber: Sequelize.STRING,
      Reciept: Sequelize.STRING,
      JParam: Sequelize.STRING,
      CreditCardNumber: Sequelize.STRING,
      CreditCardExpDate: Sequelize.STRING,
      CreditCardCompanyClearer: Sequelize.STRING,
      CreditCardCompanyIssuer: Sequelize.STRING,
      CreditCardStarsDiscountTotal: Sequelize.STRING,
      CreditType: Sequelize.STRING,
      CreditCardAbroadCard: Sequelize.STRING,
      DebitType: Sequelize.STRING,
      DebitCode: Sequelize.STRING,
      DebitTotal: Sequelize.INTEGER,
      DebitApproveNumber: Sequelize.STRING,
      DebitCurrency: Sequelize.STRING,
      TotalPayments: Sequelize.INTEGER,
      FirstPaymentTotal: Sequelize.INTEGER,
      FixedPaymentTotal: Sequelize.INTEGER,
      AdditionalDetailsParamX: Sequelize.STRING,
      shvaOutput: Sequelize.TEXT,
      CardHebName: Sequelize.STRING,
      CreditCardBrand: Sequelize.STRING,
      ApprovedBy: Sequelize.STRING,
      CallReason: Sequelize.STRING,
      Token: Sequelize.STRING,
      Tz: Sequelize.STRING,
      Uid: Sequelize.STRING,
      eci: Sequelize.STRING,
      xid: Sequelize.STRING,
      cavv: Sequelize.STRING,
      Terminal: Sequelize.STRING,
      TerminalName: Sequelize.STRING,
      AppVersion: Sequelize.STRING,
      compRetailerNum: Sequelize.STRING,
      dateTime: Sequelize.STRING,
      RRN: Sequelize.STRING,
      Atc: Sequelize.STRING,
      TSI: Sequelize.STRING,
      ARC: Sequelize.STRING,
      TVR: Sequelize.STRING,
      AID: Sequelize.STRING,

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      supportsSearchPath: false,
    }
  );
}

export async function down(queryInterface) {
  await queryInterface.dropTable("wallet_pele_payments", {
    supportsSearchPath: false,
  });
}
