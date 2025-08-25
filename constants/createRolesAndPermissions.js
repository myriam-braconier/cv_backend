import { Sequelize, DataTypes } from "sequelize";
import config from "../config/config.js";
import RoleInit from "../models/role.js";
import PermissionInit from "../models/permission.js";

const env = process.env.NODE_ENV || "development";
const { database, username, password, host, dialect } = config[env];

const sequelize = new Sequelize(database, username, password, {
    host,
    dialect,
});

const Role = RoleInit(sequelize, DataTypes);
const Permission = PermissionInit(sequelize, DataTypes);

Role.belongsToMany(Permission, { through: "RolePermissions" });
Permission.belongsToMany(Role, { through: "RolePermissions" });

const PERMISSIONS = {
    'users:read': 'users:read',
    'users:create': 'users:create',
    'users:update': 'users:update',
    'users:delete': 'users:delete',
    'synths:read': 'synths:read',
    'synths:create': 'synths:create',
    'synths:update': 'synths:update',
    'synths:delete': 'synths:delete',
    'posts:read': 'posts:read',
    
};

const roles = [
    { name: "admin", description: "Administrateur avec tous les droits" },
    { name: "user", description: "Utilisateur standard" },
    { name: "moderator", description: "Modérateur avec des droits étendus" },
    { name: "owner_instr", description: "Propriétaire" },
    { name: "creator", description: "Créateur" },
];

const rolePermissions = {
    admin: Object.keys(PERMISSIONS),
    moderator: ['users:read', 'users:update', 'synths:read', 'synths:create'],
    owner_instr: ['users:read', 'users:create', 'users:update', 'users:delete', 'synths:read', 'synths:create', 'synths:update'],
    creator: ['synths:read', 'synths:create', 'synths:update'],
    user: ['users:read', 'synths:read',]
};

const permissions = Object.values(PERMISSIONS).map((name) => ({ name }));

const createRolesAndPermissions = async () => {
    try {
        await sequelize.authenticate();
        console.log("Connexion à la base de données établie avec succès.");
        await sequelize.sync();

        const createdPermissions = await Permission.bulkCreate(permissions, {
            ignoreDuplicates: true,
        });

        const createdRoles = await Role.bulkCreate(roles, {
            ignoreDuplicates: true,
            updateOnDuplicate: ["description"],
        });

        for (const [roleName, perms] of Object.entries(rolePermissions)) {
            const role = await Role.findOne({ where: { name: roleName }});
            const rolePerms = await Permission.findAll({
                where: { name: perms }
            });
            await role.setPermissions(rolePerms);
        }

        console.log("Rôles et permissions créés ou mis à jour avec succès");
    } catch (error) {
        console.error("Erreur lors de la création des rôles et permissions:", error);
    } finally {
        await sequelize.close();
    }
};

createRolesAndPermissions();