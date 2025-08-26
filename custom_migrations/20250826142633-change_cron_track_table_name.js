export async function up(queryInterface, Sequelize) {
  await queryInterface.renameTable('CronTrack', 'cron_track', {
    supportsSearchPath: false,
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.renameTable('cron_track', 'CronTrack', {
    supportsSearchPath: false,
  });
}