export const initModel = (sequelize, DataTypes) => {
	const Post = sequelize.define(
		"Post",
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
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
				allowNull: true,
			},
			statut: {
				type: DataTypes.ENUM("brouillon", "publié", "archivé"),
				defaultValue: "brouillon",
			},
			userId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: "users",
					key: "id",
				},
			},
			synthetiserId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
				table: "synthetisers",
					key: "id",
				},
			},
		},
		{
			tableName: "posts",
			timestamps: true,
		}
	);

	Post.associate = (models) => {


	       if (models.User) {
            Post.belongsTo(models.User, {
                foreignKey: "userId",
                as: "author"  // Singulier car c'est une relation belongsTo
            });
        }

		if (models.Synthetiser) {
            Post.belongsTo(models.Synthetiser, {
                foreignKey: "synthetiserId",
                as: "synthetisers",
				references: {
					model: "synthetisers", // Majuscule
					key: "id",
				},

            });
        }
	};

	return Post;
};

export default initModel;
