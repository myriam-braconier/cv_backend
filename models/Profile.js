import { Model, DataTypes } from 'sequelize';

export class Profile extends Model {
 static associate(models) {
   Profile.belongsTo(models.User, { foreignKey: 'userId' });
 }
}

export const initProfile = (sequelize) => {
 Profile.init({
   bio: {
     type: DataTypes.TEXT,
     allowNull: true
   },
   location: {
     type: DataTypes.STRING,
     allowNull: true
   },
   birthDate: {
     type: DataTypes.DATE,
     allowNull: true
   },
   avatarUrl: {
     type: DataTypes.STRING,
     allowNull: true
   }
 }, {
   sequelize,
   modelName: 'Profile',
   tableName: 'profiles', 
   timestamps: true
 });

 return Profile;
};

export default Profile;