 export const initModel = (sequelize, DataTypes) => {
      const role = sequelize.define(
        "role",
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

  role.associate = (models) => {
    // Association avec Permission
    role.belongsToMany(models.permission, {
      through: 'RolePermission',
      as: 'permissions',  // Important pour générer les méthodes setPermissions et getPermissions
      foreignKey: 'roleId',
      otherKey: 'permissionId'
    });

    // Association avec User 
    role.hasMany(models.user, {
      as: 'users', // alias pour les requêtes
      foreignKey: 'roleId',
      as: 'users'
    });
  }

  return role;
};

export default initModel;
