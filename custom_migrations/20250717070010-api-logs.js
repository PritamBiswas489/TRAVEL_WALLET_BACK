export async function up(queryInterface, Sequelize) {
  console.log('🟢 Migration running: create-api-logs');

  await queryInterface.createTable('api_logs', {
    id: {
      type: Sequelize.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    ip: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    deviceId: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    userId: {
      type: Sequelize.BIGINT, // Match type with users.id
      allowNull: true,
      defaultValue: 0,
      references: {
        model: 'users', // table name
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    routePath: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    ipCountry: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    ipRegion: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    ipCity: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    ipIsp: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    ipLat: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    ipLon: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    ipTimezone: {
      type: Sequelize.STRING,
      allowNull: true,
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
    supportsSearchPath: false,
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable('api_logs', {
    supportsSearchPath: false
  });
}
