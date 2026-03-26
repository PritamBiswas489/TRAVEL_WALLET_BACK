
export async function up(queryInterface, Sequelize) {
  return queryInterface.addColumn('thai_payments', 'amount', {
    type: Sequelize.DECIMAL(18, 2),
    allowNull: true,
    comment: 'Amount for Thai payment',
  },{
    supportsSearchPath: false,
  });
}


export async function down(queryInterface, Sequelize) {
  // Remove 'amount' column from 'thai_payments' table
  return queryInterface.removeColumn('thai_payments', 'amount',{ supportsSearchPath: false });
}
