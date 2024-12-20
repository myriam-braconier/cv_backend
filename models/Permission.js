  export const initModel = (sequelize, DataTypes) =>  {
    const permission = sequelize.define(
      "permission",{
   name: {
     type: DataTypes.STRING,
     allowNull: false,
     defaultValue: 'default_permission_name'
   },
   description: {
     type: DataTypes.STRING,
     allowNull: true,
   },
 }, {
   sequelize,
   modelName: 'Permission',
 });

 permission.associate = (models) => {
  permission.belongsToMany(models.role, {
      through: 'RolePermission',
      as: 'role',  // Important pour générer les méthodes
      foreignKey: 'permissionId',
      otherKey: 'roleId'
  });
};

 return permission;
};

export default initModel;