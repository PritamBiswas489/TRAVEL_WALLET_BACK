export async function up(queryInterface, Sequelize) {
  await queryInterface.removeConstraint('user_settings', 'user_settings_key_key', {
      supportsSearchPath: false,
    });
}

export async function down(queryInterface, Sequelize) {
  // TODO: drop table
  await queryInterface.addConstraint('user_settings', {
      fields: ['key'],
      type: 'unique',
      name: 'user_settings_key_key',
      supportsSearchPath: false,
    });   
}
