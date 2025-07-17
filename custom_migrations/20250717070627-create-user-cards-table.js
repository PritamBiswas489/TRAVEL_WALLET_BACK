export async function up(queryInterface, Sequelize) {
  console.log('🟢 Migration running: create-user-cards');

  await queryInterface.createTable('user_cards', {
    id: {
      type: Sequelize.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: Sequelize.BIGINT,
      allowNull: false,
      references: {
        model: 'users', // Make sure this matches your actual table name
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    cardHolderName: { type: Sequelize.STRING, allowNull: true },
    nationalId: { type: Sequelize.STRING, allowNull: true },
    VoucherId: { type: Sequelize.STRING, allowNull: true },
    ShvaResult: { type: Sequelize.STRING, allowNull: true },
    ShvaResultEmv: { type: Sequelize.STRING, allowNull: true },
    ShvaFileNumber: { type: Sequelize.STRING, allowNull: true },
    StationNumber: { type: Sequelize.STRING, allowNull: true },
    Reciept: { type: Sequelize.STRING, allowNull: true },
    JParam: { type: Sequelize.STRING, allowNull: true },
    CreditCardNumber: { type: Sequelize.STRING, allowNull: true },
    CreditCardExpDate: { type: Sequelize.STRING, allowNull: true },
    CreditCardCompanyClearer: { type: Sequelize.STRING, allowNull: true },
    CreditCardCompanyIssuer: { type: Sequelize.STRING, allowNull: true },
    CreditCardStarsDiscountTotal: { type: Sequelize.STRING, allowNull: true },
    CreditType: { type: Sequelize.STRING, allowNull: true },
    CreditCardAbroadCard: { type: Sequelize.STRING, allowNull: true },
    DebitType: { type: Sequelize.STRING, allowNull: true },
    DebitCode: { type: Sequelize.STRING, allowNull: true },
    DebitTotal: { type: Sequelize.STRING, allowNull: true },
    DebitApproveNumber: { type: Sequelize.STRING, allowNull: true },
    DebitCurrency: { type: Sequelize.STRING, allowNull: true },
    TotalPayments: { type: Sequelize.STRING, allowNull: true },
    FirstPaymentTotal: { type: Sequelize.STRING, allowNull: true },
    FixedPaymentTotal: { type: Sequelize.STRING, allowNull: true },
    AdditionalDetailsParamX: { type: Sequelize.STRING, allowNull: true },
    shvaOutput: { type: Sequelize.TEXT, allowNull: true },
    CardHebName: { type: Sequelize.STRING, allowNull: true },
    CreditCardBrand: { type: Sequelize.STRING, allowNull: true },
    ApprovedBy: { type: Sequelize.STRING, allowNull: true },
    CallReason: { type: Sequelize.STRING, allowNull: true },
    Token: { type: Sequelize.STRING, allowNull: true },

    isDefault: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },

    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    }
  }, {
    supportsSearchPath: false
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable('user_cards', {
    supportsSearchPath: false,
  });
}
