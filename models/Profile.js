export const initModel = (sequelize, DataTypes) =>  {
 const Profile = sequelize.define("Profile", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
},
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
 
   tableName: 'profiles', 
   timestamps: true
 }
);

Profile.associate = (models) => {

  if(models.User) {
  Profile.belongsTo(models.User, { foreignKey: 'userId' });
  }
};
 return Profile;
};

export default initModel;