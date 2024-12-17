import { Model, DataTypes } from "sequelize";

export class Post extends Model {
 static associate(models) {
   Post.belongsTo(models.User, {
     foreignKey: {
       name: "userId",
       allowNull: true,
     },
   });
   Post.belongsTo(models.Synthetiser, {
     foreignKey: {
       name: "synthetiserId",
       allowNull: true,
     },
   });
 }
}

export const initPost = (sequelize) => {
 Post.init(
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
     sequelize,
     modelName: "Post",
     tableName: "posts",
     timestamps: true,
   }
 );

 return Post;
};

export default Post;