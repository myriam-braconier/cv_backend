import { Sequelize } from "sequelize";
import config from "../config/config.js";
import { Role, initRole } from "../models/Role.js";

const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];

const sequelize = new Sequelize(
	dbConfig.database,
	dbConfig.username,
	dbConfig.password,
	{
		host: dbConfig.host,
		dialect: dbConfig.dialect,
	}
);

// Initialiser le modèle Role
initRole(sequelize);

const roles = [
	{
		name: "admin",
		description: "Administrateur avec tous les droits",
	},
	{
		name: "user",
		description: "Utilisateur standard",
	},
	{
		name: "moderator",
		description: "Modérateur avec des droits étendus",
	},
	{
		name: "owner",
		description: "Propriétaire",
	},
	{
		name: "creator",
		description: "Créateur",
	},
];

const createRoles = async () => {
	try {
		await sequelize.authenticate();
		console.log("Connexion à la base de données établie avec succès.");

		await sequelize.sync();

		const createdRoles = await Role.bulkCreate(roles, {
			validate: true,
			ignoreDuplicates: true,
			updateOnDuplicate: ["description"],
		});

		console.log(
			"Rôles créés ou mis à jour avec succès:",
			createdRoles.map((role) => role.name)
		);
	} catch (error) {
		console.error("Erreur lors de la création des rôles:", error);
	} finally {
		await sequelize.close();
	}
};

// Exécution immédiate
createRoles();
