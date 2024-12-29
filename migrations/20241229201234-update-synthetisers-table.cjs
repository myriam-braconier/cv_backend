'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('synthetisers', 'price', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('synthetisers', 'price', {
      type: Sequelize.STRING,
      allowNull: true
    });
  }
};
