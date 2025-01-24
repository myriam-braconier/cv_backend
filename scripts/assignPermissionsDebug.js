import { Sequelize, DataTypes } from "sequelize";
import config from "../config/config.js";
import initPermissionModel from "../models/permission.js";
import initRoleModel from "../models/role.js";

const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];

// S'assurer que toutes les options nécessaires sont présentes
const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
        host: dbConfig.host,
        dialect: dbConfig.dialect,
        logging: console.log
    }
);

// Tester la connexion
try {
    await sequelize.authenticate();
    console.log('Connection à la base de données réussie.');

    // Initialiser les modèles
    const Permission = initPermissionModel(sequelize, DataTypes);
    const Role = initRoleModel(sequelize, DataTypes);

    // Initialiser les associations
    const models = { Permission, Role };
    Object.values(models).forEach(model => {
        if (typeof model.associate === 'function') {
            model.associate(models);
        }
    });


const checkAndAssignPermissions = async () => {
	try {
		// 1. Vérifier les rôles existants
		console.log("\n=== Vérification des rôles ===");
		const roles = await Role.findAll();
		console.log(
			"Rôles trouvés:",
			roles.map((r) => ({ id: r.id, name: r.name }))
		);

		// 2. Vérifier les permissions existantes
		console.log("\n=== Vérification des permissions ===");
		const permissions = await Permission.findAll();
		console.log(
			"Permissions trouvées:",
			permissions.map((p) => ({ id: p.id, name: p.name }))
		);

		// 3. Attribution des permissions pour chaque rôle
		console.log("\n=== Attribution des permissions ===");
		const rolePermissions = {
			user: ["synths:read", "users:read"],
			moderator: ["synths:read", "synths:create", "users:read", "users:update"],
			admin: [
				"synths:read",
				"synths:create",
				"synths:update",
				"synths:delete",
				"users:read",
				"users:create",
				"users:update",
				"users:delete",
			],
			creator: ["synths:read", "synths:create", "synths:update"],
			owner_instr: [
				"synths:read",
				"synths:create",
				"synths:update",
				"users:read",
				"users:create",
				"users:update",
				"users:delete",
			],
		};

		// Pour chaque rôle dans rolePermissions
		for (const [roleName, permissionNames] of Object.entries(rolePermissions)) {
			console.log(`\nTraitement du rôle: ${roleName}`);

			// Trouver ou créer le rôle
			const [role] = await Role.findOrCreate({
				where: { name: roleName },
			});

			if (!role) {
				console.log(`⚠️ Rôle ${roleName} non trouvé`);
				continue;
			}

			// Trouver les permissions existantes pour ce rôle
			const existingPermissions = await Permission.findAll({
				where: { name: permissionNames },
			});

			console.log(
				`Permissions trouvées pour ${roleName}:`,
				existingPermissions.map((p) => p.name)
			);

			// Créer les permissions manquantes
			const permissionPromises = permissionNames.map(async (permName) => {
				const [permission] = await Permission.findOrCreate({
					where: { name: permName },
					defaults: {
						description: `Permission for ${permName}`,
					},
				});
				return permission;
			});

			const allPermissions = await Promise.all(permissionPromises);

			// Associer les permissions au rôle
			await role.setPermissions(allPermissions);

			console.log(
				`Permissions assignées au rôle ${roleName}:`,
				allPermissions.map((p) => p.name)
			);
		}

		console.log("Attribution des permissions terminée avec succès");
		await sequelize.close();
		process.exit(0);
	} catch (error) {
		console.error("Erreur:", error);
		await sequelize.close();
		process.exit(1);
	}
};


// Exécution
console.log("=== Début de l'attribution des permissions ===");
checkAndAssignPermissions();

} catch (error) {
    console.error('Impossible de se connecter à la base de données:', error);
    process.exit(1);
}
