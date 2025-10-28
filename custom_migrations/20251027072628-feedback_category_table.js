export async function up(queryInterface, Sequelize) {
    await queryInterface.createTable(
    "feedback_category",
    {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      engText: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      heText: {
        type: Sequelize.STRING,
        allowNull: false,
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
    }
  );
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("FeedbackCategory");
}
export async function seed(queryInterface, Sequelize) {
  await queryInterface.bulkInsert('FeedbackCategory', [
    {
      engText: 'Transactions',
      heText: 'עסקאות',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      engText: 'Wallet Balance',
      heText: 'יתרת ארנק',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      engText: 'Money Transfer',
      heText: 'העברת כספים',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      engText: 'Bill Payments',
      heText: 'תשלומי חשבונות',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      engText: 'Security',
      heText: 'אבטחה',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      engText: 'User Interface',
      heText: 'ממשק משתמש',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      engText: 'Other',
      heText: 'אחר',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
}