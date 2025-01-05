import sequelize from "./sequelize.js";
import initUser from "../models/User.js";
import initRole from "../models/Role.js";
import initSynthetiser from "../models/Synthetiser.js";
import initPost from "../models/Post.js";
import initProfile from "../models/Profile.js";
import initPermission from "../models/Permission.js";
import initAuctionPrice from "../models/AuctionPrice.js";
import { DataTypes } from "sequelize";

const syncModels = async () => {
	try {

// Désactiver les contraintes
await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");


		// Vérification de la connexion
		await sequelize.authenticate();
		console.log("Connexion établie");

		// Initialisation des modèles avec DataTypes
		const models = {
			// tables indépendantes
			Role: initRole(sequelize, DataTypes),
			User: initUser(sequelize, DataTypes),
			//  tables avec dépendances simples
			Synthetiser: initSynthetiser(sequelize, DataTypes),
			Auctionprice: initAuctionPrice(sequelize, DataTypes),
			//  tables avec dépendances multiples
			Post: initPost(sequelize, DataTypes),
			
			// tables avec relations complexex
			Profile: initProfile(sequelize, DataTypes),
			Permission: initPermission(sequelize, DataTypes),
		};

		

		// Définition des associations
		Object.values(models).forEach((model) => {
			if (typeof model.associate === "function") {
				model.associate(models);
			}
		});

		// Synchronisation avec la base de données
		await sequelize.sync({ alter: true });

		// Réactiver les contraintes
		await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
		console.log("Models synchronized successfully");
	} catch (error) {
		console.error("Error synchronizing models:", error);
		throw error;
	} finally {
		await sequelize.close();
	}
};

// Exécution avec gestion d'erreur
(async () => {
	try {
		await syncModels();
		process.exit(0);
	} catch (error) {
		console.error("Fatal error:", error);
		process.exit(1);
	}
})();
