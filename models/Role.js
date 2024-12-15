import { Model, DataTypes } from "sequelize";

export default function(sequelize) {
  class Role extends Model {
    static associate(models) {
      Role.belongsToMany(models.User, { 
        through: 'UserRoles',
        foreignKey: 'roleId',
        otherKey: 'userId'
      });
    }
  }

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
        allowNull: true,
      },
      permission: {
        type: DataTypes.JSON,
        allowNull: false,
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
}
