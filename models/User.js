import { Model, DataTypes } from 'sequelize';

export class User extends Model {
 static associate(models) {
   User.hasMany(models.Post, { foreignKey: 'userId' });
   User.hasOne(models.Profile, { foreignKey: 'userId' });
   User.belongsToMany(models.Role, {
     through: 'UserRoles',
     foreignKey: 'userId',
     otherKey: 'roleId'
   });
 }
}


export const initUser = (sequelize) => {
 User.init({
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  has_instrument: {
    type: DataTypes.BOOLEAN
  },
  age: {
    type: DataTypes.INTEGER
  }

 }, {
   sequelize,
   modelName: 'User',
   tableName: 'users',
   timestamps: true
 });

 return User;
};

export default User;