'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Supprimez d'abord la colonne price existante
    await queryInterface.removeColumn('synthetisers', 'price');
    
    // Ajoutez les nouvelles colonnes
    await queryInterface.addColumn('synthetisers', 'price_value', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true
    });
    
    await queryInterface.addColumn('synthetisers', 'price_currency', {
      type: Sequelize.STRING(3),
      defaultValue: 'EUR',
      allowNull: true
    });

    await queryInterface.addColumn('synthetisers', 'last_updated_by', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('synthetisers', 'price_value');
    await queryInterface.removeColumn('synthetisers', 'price_currency');
    await queryInterface.removeColumn('synthetisers', 'last_updated_by');
    
    await queryInterface.addColumn('synthetisers', 'price', {
      type: Sequelize.STRING,
      allowNull: true
    });
  }
};