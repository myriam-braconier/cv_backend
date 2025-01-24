export const initModel = (sequelize, DataTypes) => {
    const RolePermission = sequelize.define(
      "RolePermission",
      {
        roleId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'roles',
            key: 'id'
          }
        },
        permissionId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'permissions',
            key: 'id'
          }
        }
      },
      {
        tableName: "rolepermission",
        timestamps: true,
      }
    );
  
    return RolePermission;
  };
  
  export default initModel;