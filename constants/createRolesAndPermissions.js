import { Sequelize, DataTypes } from "sequelize";
import config from "../config/config.js";
import RoleModel from "../models/role.js";
import PermissionModel from "../models/Permission.js";
import { PERMISSIONS } from "./permissions.js";

const env = process.env.NODE_ENV || "development";
const { database, username, password, host, dialect } = config[env];

const sequelize = new Sequelize(database, username, password, {
	host,
	dialect,
	logging: console.log, // ✅ Ajouter pour voir les requêtes SQL
});

const Role = RoleModel(sequelize, DataTypes);
const Permission = PermissionModel(sequelize, DataTypes);

// ⚠️ IMPORTANT: Ajouter les alias pour correspondre à vos modèles
Role.belongsToMany(Permission, {
	through: "RolePermission",
	as: "permissions", // ✅ Ajouter l'alias
	foreignKey: "roleId",
	otherKey: "permissionId",
});
Permission.belongsToMany(Role, {
	through: "RolePermission",
	as: "role", // ✅ Ajouter l'alias
	foreignKey: "permissionId",
	otherKey: "roleId",
});

const roles = [
	{ name: "admin", description: "Administrateur avec tous les droits" },
	{ name: "user", description: "Utilisateur standard" },
	{ name: "moderator", description: "Modérateur avec des droits étendus" },
	{ name: "owner_instr", description: "Propriétaire" },
	{ name: "creator", description: "Créateur" },
];

const rolePermissions = {
	admin: [
		"users:read",
		"users:create",
		"users:update",
		"users:delete",
		"synths:read",
		"synths:create",
		"synths:update",
		"synths:delete",
	],
	moderator: ["users:read", "users:update", "synths:read", "synths:create"],
	owner_instr: [
		"auctions:create",
		"auctions:read",
		"auctions:update",
		"synths:bid",
		"users:read",
		"users:update",
		"synths:read",
		"synths:create",
		"synths:update",
	],
	creator: ["synths:read", "synths:update", "auctions:create",
		"auctions:read", "synths:bid","users:update", "posts:read", "posts:create"],
	user: ["users:read", "synths:read"],
};

const permissions = Object.values(PERMISSIONS).map((name) => ({ name }));

const createRolesAndPermissions = async () => {
	try {
		console.log("🔍 === DÉBUT CRÉATION RÔLES ET PERMISSIONS ===");

		// await sequelize.authenticate();
		// console.log("✅ Connexion à la base de données établie avec succès.");
		// // Force sync pour créer les tables si nécessaire : force: true
		//    await sequelize.sync({ force: false});
		await sequelize.authenticate();
		console.log("✅ Connexion à la base de données établie avec succès.");


        // Pouur metre à jour les permisions en otant puis rétablissant les clés étrangères

		// ✅ Désactiver temporairement les contraintes FK
		await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
		console.log("✅ Contraintes de clés étrangères désactivées");

		// Force sync pour créer les tables si nécessaire
		await sequelize.sync({ force: true });
		console.log("✅ Tables synchronisées");

		// ✅ Réactiver les contraintes FK
		await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
		console.log("✅ Contraintes de clés étrangères réactivées");

		console.log("✅ Tables synchronisées");

		// ✅ ÉTAPE 1: Créer les permissions
		console.log("\n📝 === CRÉATION DES PERMISSIONS ===");
		console.log(
			`Permissions à créer:`,
			permissions.map((p) => p.name)
		);

		const createdPermissions = await Permission.bulkCreate(permissions, {
			ignoreDuplicates: true,
		});
		console.log(`✅ ${permissions.length} permissions traitées`);

		// Vérifier les permissions créées
		const allPermissions = await Permission.findAll();
		console.log(`✅ Total permissions en base: ${allPermissions.length}`);

		// ✅ ÉTAPE 2: Créer les rôles
		console.log("\n👑 === CRÉATION DES RÔLES ===");
		const createdRoles = await Role.bulkCreate(roles, {
			ignoreDuplicates: true,
			updateOnDuplicate: ["description"],
		});
		console.log(`✅ ${roles.length} rôles traités`);

		// Vérifier les rôles créés
		const allRoles = await Role.findAll();
		console.log(`✅ Total rôles en base: ${allRoles.length}`);
		allRoles.forEach((role) =>
			console.log(`  - ${role.name} (ID: ${role.id})`)
		);

		// ✅ ÉTAPE 3: Associer les permissions aux rôles
		console.log("\n🔗 === ASSOCIATION PERMISSIONS ↔ RÔLES ===");

		for (const [roleName, perms] of Object.entries(rolePermissions)) {
			console.log(`\n📋 Traitement du rôle: ${roleName}`);

			const role = await Role.findOne({ where: { name: roleName } });
			if (!role) {
				console.log(`❌ Rôle ${roleName} non trouvé`);
				continue;
			}
			console.log(`✅ Rôle trouvé: ${role.name} (ID: ${role.id})`);

			console.log(`🔍 Recherche des permissions:`, perms);
			const rolePerms = await Permission.findAll({
				where: { name: perms },
			});

			console.log(
				`✅ ${rolePerms.length}/${perms.length} permissions trouvées:`
			);
			rolePerms.forEach((perm) =>
				console.log(`  - ${perm.name} (ID: ${perm.id})`)
			);

			// Permissions manquantes
			const foundPermNames = rolePerms.map((p) => p.name);
			const missingPerms = perms.filter((p) => !foundPermNames.includes(p));
			if (missingPerms.length > 0) {
				console.log(`⚠️ Permissions manquantes:`, missingPerms);
			}

			console.log(`🔗 Association des permissions au rôle ${roleName}...`);
			await role.setPermissions(rolePerms);
			console.log(`✅ Permissions associées au rôle ${roleName}`);
		}

		// ✅ ÉTAPE 4: Vérification finale
		console.log("\n🔍 === VÉRIFICATION FINALE ===");

		for (const roleName of Object.keys(rolePermissions)) {
			const role = await Role.findOne({
				where: { name: roleName },
				include: [
					{
						model: Permission,
						as: "permissions",
						through: { attributes: [] },
					},
				],
			});

			if (role) {
				console.log(`✅ ${roleName}: ${role.permissions.length} permissions`);
				role.permissions.forEach((perm) => console.log(`  - ${perm.name}`));
			} else {
				console.log(`❌ ${roleName}: rôle non trouvé`);
			}
		}

		// Vérification spéciale pour owner_instr
		console.log("\n🎯 === VÉRIFICATION SPÉCIALE OWNER_INSTR ===");
		const ownerRole = await Role.findOne({
			where: { name: "owner_instr" },
			include: [
				{
					model: Permission,
					as: "permissions",
					through: { attributes: [] },
				},
			],
		});

		if (ownerRole && ownerRole.permissions.length > 0) {
			console.log(
				`🎉 SUCCESS! owner_instr a ${ownerRole.permissions.length} permissions:`
			);
			ownerRole.permissions.forEach((perm) => console.log(`  ✓ ${perm.name}`));

			// Vérifier synths:read spécifiquement
			const hasSynthsRead = ownerRole.permissions.some(
				(p) => p.name === "synths:read"
			);
			console.log(
				`🔍 A la permission synths:read: ${hasSynthsRead ? "OUI ✅" : "NON ❌"}`
			);
		} else {
			console.log(`❌ PROBLÈME: owner_instr n'a aucune permission`);
		}

		console.log("\n🎉 === SCRIPT TERMINÉ AVEC SUCCÈS ===");
	} catch (error) {
		console.error("❌ === ERREUR LORS DE LA CRÉATION ===");
		console.error("Type:", error.name);
		console.error("Message:", error.message);
		console.error("Stack:", error.stack);
	} finally {
		await sequelize.close();
		console.log("🔒 Connexion fermée");
	}
};

createRolesAndPermissions();
