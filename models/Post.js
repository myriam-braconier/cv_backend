export const initModel = (sequelize, DataTypes) => {
  const post = sequelize.define(
		"post", 
   {
     commentaire: {
       type: DataTypes.STRING,
       allowNull: true,
     },
     titre: {
       type: DataTypes.STRING,
       allowNull: true,
     },
     contenu: {
       type: DataTypes.TEXT,
       allowNull: true,
     },
     type_contenu: {
       type: DataTypes.ENUM("texte", "video", "audio", "lien"),
       allowNull: true,
     },
     url_contenu: {
       type: DataTypes.STRING,
       allowNull: true,
     },
     format: {
       type: DataTypes.STRING,
       allowNull: true
     },
     statut: {
       type: DataTypes.ENUM("brouillon", "publié", "archivé"),
       defaultValue: "brouillon",
     },
   },
   {
     tableName: "posts",
     timestamps: true,
   }
 );

 post.associate = (models) => {
 
  post.belongsTo(models.user, {
    foreignKey: {
      name: "userId",
      allowNull: true,
    },
  });

  post.belongsTo(models.synthetiser, {
    foreignKey: {
      name: "synthetiserId",
      allowNull: true,
    },
  }); 
};
 return post;
};

export default initModel;