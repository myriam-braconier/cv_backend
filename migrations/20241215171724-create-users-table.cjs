"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("users", {
			id: {
				type: Sequelize.INTEGER,
				autoIncrement: true,
				primaryKey: true,
				allowNull: false,
			},
			username: {
				type: Sequelize.STRING,
				allowNull: false,
				unique: true,
			},
			firstName: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			lastName: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			age: {
				type: Sequelize.INTEGER,
				allowNull: true,
				validate: {
					min: 0,
					max: 120,
				},
			},
			has_instrument: {
				type: Sequelize.BOOLEAN,
				allowNull: true,
				defaultValue: false,
			},
			password: {
				type: Sequelize.STRING,
				allowNull: false,
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
		await queryInterface.dropTable("users");
	},
};
