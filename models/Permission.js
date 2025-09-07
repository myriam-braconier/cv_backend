  export const initModel = (sequelize, DataTypes) =>  {
    const Permission = sequelize.define(
      "Permission",{
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
   tableName: 'permissions',
 });

 Permission.associate = (models) => {
  Permission.belongsToMany(models.Role, {
      through: models.RolePermission,
      as: 'roles',  // Important pour générer les méthodes
      foreignKey: 'permissionId',
      otherKey: 'roleId'
  });
};

 return Permission;
};

export default initModel;