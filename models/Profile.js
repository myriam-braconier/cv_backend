export const initModel = (sequelize, DataTypes) =>  {
 const profile = sequelize.define("profile", {
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

profile.associate = (models) => {
  profile.belongsTo(models.user, { foreignKey: 'userId' });
};
 return profile;
};

export default initModel;