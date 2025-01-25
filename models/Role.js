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
      through: models.RolePermission, // Utilisez le modèle RolePermission
      as: 'permissions',
      foreignKey: 'roleId',
      otherKey: 'permissionId'
    });

    // Association avec User 
    if (models.User) {
      Role.hasMany(models.User, {
        foreignKey: 'roleId',
        as: 'role'  
      });
    }
  };

  return Role;
};

export default initModel;