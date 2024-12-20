 export const initModel = (sequelize, DataTypes) => {
      const Role = sequelize.define(
        "Role",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          name: "unique_role_name",
        },
        validate: {
          notNull: { msg: "Le nom du rôle est requis" },
          notEmpty: { msg: "Le nom du rôle ne peut pas être vide" },
        },
      },

      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      permission: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {},
      },

    },
    {
      tableName: "roles",
      timestamps: true,
    }
  );

  Role.associate = (models) => {
    // Association avec Permission
    Role.belongsToMany(models.Permission, {
      through: 'RolePermission',
      as: 'permissions',  // Important pour générer les méthodes setPermissions et getPermissions
      foreignKey: 'roleId',
      otherKey: 'permissionId'
    });

    // Association avec User 
    if (models.User) {
    Role.hasMany(models.User, {
      as: 'users', // alias pour les requêtes
      foreignKey: 'roleId',
      as: 'users'
    });
  }
  }

  return Role;
};

export default initModel;
