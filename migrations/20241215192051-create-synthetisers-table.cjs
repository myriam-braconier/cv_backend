"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("synthetisers", {
			id: {
				type: Sequelize.INTEGER,
				autoIncrement: true,
				primaryKey: true,
				allowNull: false,
			},
			marque: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			modele: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			specifications: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			image_url: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			note: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			nb_avis: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			price: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			createdAt: {
				type: Sequelize.DATE,
				allowNull: false,
			},
			updatedAt: {
				type: Sequelize.DATE,
				allowNull: false,
			},
		});
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable("synthetisers");
	},
};
