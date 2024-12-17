import { Model, DataTypes } from 'sequelize';

export class Permission extends Model {
 static associate(models) {
   // Définir les associations ici
 }
}

export const initPermission = (sequelize) => {
 Permission.init({
   name: {
     type: DataTypes.STRING,
     allowNull: false,
   },
   description: {
     type: DataTypes.STRING,
     allowNull: true,
   },
 }, {
   sequelize,
   modelName: 'Permission',
 });

 return Permission;
};

export default Permission;