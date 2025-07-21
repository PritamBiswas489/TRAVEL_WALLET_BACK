export async function up(queryInterface, Sequelize) {
   await queryInterface.renameColumn('transfer_requests', 'created_at', 'createdAt', {
    supportsSearchPath: false,
  });

  await queryInterface.renameColumn('transfer_requests', 'updated_at', 'updatedAt', {
    supportsSearchPath: false,
  });
   await queryInterface.renameColumn('transfer_requests', 'sender_id', 'senderId', {
    supportsSearchPath: false,
  });

  await queryInterface.renameColumn('transfer_requests', 'receiver_id', 'receiverId', {
    supportsSearchPath: false,
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.renameColumn('transfer_requests', 'createdAt', 'created_at', {
    supportsSearchPath: false,
  });

  await queryInterface.renameColumn('transfer_requests', 'updatedAt', 'updated_at', {
    supportsSearchPath: false,
  });
  await queryInterface.renameColumn('transfer_requests', 'senderId', 'sender_id', {
    supportsSearchPath: false,
  });

  await queryInterface.renameColumn('transfer_requests', 'receiverId', 'receiver_id', {
    supportsSearchPath: false,
  });
}
  
 
