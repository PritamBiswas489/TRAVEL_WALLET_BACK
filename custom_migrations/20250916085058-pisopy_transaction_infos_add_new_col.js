export async function up(queryInterface, Sequelize) {
   await queryInterface.addColumn(
      'pisopy_transaction_infos',
      'userId',
      {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', // name of Target model
          key: 'id', // key in Target model that we're referencing
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      {
        supportsSearchPath: false,
      }
    );
    await queryInterface.addColumn(
      'pisopy_transaction_infos',
      'expenseCatId',
      {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'expensesCategories', // name of Target model
          key: 'id', // key in Target model that we're referencing
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      {
        supportsSearchPath: false,
      }
    );
    await queryInterface.addColumn(
      'pisopy_transaction_infos',
      'memo',
      {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      {
        supportsSearchPath: false,
      }
    );

    await queryInterface.addColumn(
      'pisopy_transaction_infos',
      'walletCurrency',
      {
        type: Sequelize.STRING,
        allowNull: true,
      },
      {
        supportsSearchPath: false,
      }
    );

    await queryInterface.addColumn(
      'pisopy_transaction_infos',
      'amountInUserWalletCurrency',
      {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
      },
      {
        supportsSearchPath: false,
      }
    );


  }

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn("pisopy_transaction_infos", "userId", {
      supportsSearchPath: false,
    });
    await queryInterface.removeColumn("pisopy_transaction_infos", "expenseCatId", {
      supportsSearchPath: false,
    });
    await queryInterface.removeColumn("pisopy_transaction_infos", "memo", {
      supportsSearchPath: false,
    });
    await queryInterface.removeColumn("pisopy_transaction_infos", "walletCurrency", {
      supportsSearchPath: false,
    });
    await queryInterface.removeColumn("pisopy_transaction_infos", "amountInUserWalletCurrency", {
      supportsSearchPath: false,
    });
}
