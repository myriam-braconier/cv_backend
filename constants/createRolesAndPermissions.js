import { Sequelize } from "sequelize";
import config from "../config/config.js";
import { Role, initRole } from "../models/Role.js";
import { Permission, initPermission } from "../models/Permission.js";
import { PERMISSIONS } from "./permissions.js";

const env = process.env.NODE_ENV || "development";
const { database, username, password, host, dialect } = config[env];

// Initialisation de la base de données
const sequelize = new Sequelize(database, username, password, {
	host,
	dialect,
});

// Initialisation des modèles
initRole(sequelize);
initPermission(sequelize);

// Configuration des associations
Role.belongsToMany(Permission, { through: "RolePermissions" });
Permission.belongsToMany(Role, { through: "RolePermissions" });

// Définition des données initiales
const roles = [
	{ name: "admin", description: "Administrateur avec tous les droits" },
	{ name: "user", description: "Utilisateur standard" },
	{ name: "moderator", description: "Modérateur avec des droits étendus" },
	{ name: "owner", description: "Propriétaire" },
	{ name: "creator", description: "Créateur" },
];

const permissions = Object.values(PERMISSIONS).map((name) => ({ name }));

// Fonction principale de création des rôles et permissions
const createRolesAndPermissions = async () => {
	try {
		// Connexion à la base de données
		await sequelize.authenticate();
		console.log("Connexion à la base de données établie avec succès.");

		await sequelize.sync();

		// Création des permissions
		const createdPermissions = await Permission.bulkCreate(permissions, {
			ignoreDuplicates: true,
		});

		// Création des rôles
		const createdRoles = await Role.bulkCreate(roles, {
			ignoreDuplicates: true,
			updateOnDuplicate: ["description"],
		});

		// Configuration des permissions pour l'admin
		const adminRole = await Role.findOne({ where: { name: "admin" } });
		await adminRole.setPermissions(createdPermissions);

		// Configuration des permissions pour le modérateur
		const moderatorRole = await Role.findOne({ where: { name: "moderator" } });
		const moderatorPermissions = await Permission.findAll({
			where: {
				name: [
					PERMISSIONS.CREATE_POST,
					PERMISSIONS.EDIT_POST,
					PERMISSIONS.DELETE_POST,
				],
			},
		});
		await moderatorRole.setPermissions(moderatorPermissions);

		console.log("Rôles et permissions créés ou mis à jour avec succès");
	} catch (error) {
		console.error(
			"Erreur lors de la création des rôles et permissions:",
			error
		);
	} finally {
		await sequelize.close();
	}
};

// Exécution
createRolesAndPermissions();
