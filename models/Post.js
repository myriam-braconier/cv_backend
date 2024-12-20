export const initModel = (sequelize, DataTypes) => {
  const post = sequelize.define(
		"post", 
   {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
  },
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
     userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
      },
      synthetiserId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
				  model: 'synthetiser',
				  key: 'id'
				}
			  }

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
      as: 'author' // permet d'utiliser post.getAuthor ()
    },
  });

  post.belongsTo(models.synthetiser, {
    foreignKey: {
      name: "synthetiserId",
      allowNull: true,
      references: {
        model: 'synthetisers', // Correction du nom de la table
        key: 'id'
    },
      as: 'synthetiser'  // permet d'utiliser post.getSynthetiser()
    },
  }); 


};


 return post;
};

export default initModel;