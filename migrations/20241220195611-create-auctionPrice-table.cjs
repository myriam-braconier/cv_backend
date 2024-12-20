'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('auctionPrice', {
      id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			proposal_price: {
				type: Sequelize.DECIMAL(10, 2),
				allowNull: true,
			},
			synthetiserId: {
				type: Sequelize.INTEGER,
        allowNull: true,
        references: {                     // Ajout de la référence pour la clé étrangère
          model: 'synthetisers',
          key: 'id'
        }
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('auctionPrice');
  }
};