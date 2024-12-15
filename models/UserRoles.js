import { Model, DataTypes } from 'sequelize';

export default function(sequelize) {
  class UserRole extends Model {
    static associate(models) {
      // Définir les associations ici si nécessaire
      
    UserRole.belongsTo(models.User);
    UserRole.belongsTo(models.Role);
    }
  }

  UserRole.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Roles',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'UserRole',
    tableName: 'UserRoles',
    timestamps: true, // Si vous voulez inclure createdAt et updatedAt
    indexes: [
      {
        unique: true,
        fields: ['userId', 'roleId']
      }
    ]
  });

  return UserRole;
}
