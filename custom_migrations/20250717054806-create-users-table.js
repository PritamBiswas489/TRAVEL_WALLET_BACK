export async function up(queryInterface, Sequelize) {
  console.log('🟢 Migration running: create-users');

  await queryInterface.createTable('users', {
    id: {
      type: Sequelize.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: Sequelize.STRING,
      allowNull: true
    },
    email: {
      type: Sequelize.STRING,
      allowNull: true
    },
    phoneNumber: {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true
    },
    password: {
      type: Sequelize.STRING,
      allowNull: true
    },
    avatar: {
      type: Sequelize.STRING,
      allowNull: true
    },
    role: {
      type: Sequelize.ENUM('ADMIN', 'USER', 'SELLER', 'BOTH'),
      allowNull: true,
      defaultValue: 'USER'
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      onUpdate: Sequelize.literal('CURRENT_TIMESTAMP') // ✅ optional, for DB-level auto-update
    }
  }, {
    supportsSearchPath: false
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable('users', { supportsSearchPath: false });
}
