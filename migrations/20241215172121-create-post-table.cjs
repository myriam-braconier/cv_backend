'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('posts', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      commentaire: {
        type: Sequelize.STRING,
        allowNull: true
      },
      titre: {
        type: Sequelize.STRING,
        allowNull: true
      },
      contenu: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      type_contenu: {
        type: Sequelize.ENUM('texte', 'video', 'audio', 'lien'),
        allowNull: true
      },
      url_contenu: {
        type: Sequelize.STRING,
        allowNull: true
      },
      format: {
        type: Sequelize.STRING,
        allowNull: true
      },
      statut: {
        type: Sequelize.ENUM('brouillon', 'publié', 'archivé'),
        defaultValue: 'brouillon'
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      synthetiserId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'synthetisers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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
    await queryInterface.dropTable('posts');
  }
};
