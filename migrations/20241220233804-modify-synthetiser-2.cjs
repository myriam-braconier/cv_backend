'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Ajoutez vos nouvelles colonnes ici
      await queryInterface.addColumn('synthetisers', 'userId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      });

      // Ajoutez d'autres colonnes si nécessaire

    } catch (error) {
      console.error('Migration error:', error);
      throw error;
    }
  },

  // async down(queryInterface, Sequelize) {
  //   try {
  //     await queryInterface.removeColumn('synthetisers', 'userId');
  //     // Supprimez les autres colonnes si nécessaire
  //   } catch (error) {
  //     console.error('Migration rollback error:', error);
  //     throw error;
  //   }
  // }
};