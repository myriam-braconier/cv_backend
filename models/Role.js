import { Model, DataTypes } from "sequelize";

class Role extends Model {
  static associate(models) {
    Role.belongsToMany(models.User, {
      through: 'UserRoles',
      foreignKey: 'roleId',
      otherKey: 'userId'
    });
  }
}

export const initRole = (sequelize) => {
  Role.init(
    {
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
      sequelize,
      modelName: "Role",
      tableName: "roles",
      timestamps: true,
    }
  );
  return Role;
};

export default Role;