module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('auctionPrices');
    await queryInterface.createTable('auctionPrices', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      proposal_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('active', 'won', 'outbid', 'cancelled'),
        defaultValue: 'active'
      },
      synthetiserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
        model: "synthetisers", 
        key: "id",
        },
      },
      userId: { // Ajout explicite du champ userId
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
        model: "users",
        key: "id",
        },
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('auctionPrices');
  }
};
