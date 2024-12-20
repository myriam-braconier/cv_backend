export const initModel = (sequelize, DataTypes) => {
	const synthetiser = sequelize.define(
		"synthetiser",
		{
			marque: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			modele: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			specifications: {
				type: DataTypes.TEXT,
				allowNull: true,
				validate: {
					isValidSpecification(value) {},
				},
			},
			image_url: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			note: {
				type: DataTypes.STRING,
				allowNull: true,
				validate: {
					is: /^[0-9]{1,3}%$/,
				},
				get() {
					return this.getDataValue("note");
				},
				set(value) {
					this.setDataValue("note", value);
				},
			},
			nb_avis: {
				type: DataTypes.STRING,
				allowNull: true,
				validate: {
					is: /^[0-9]+ avis$/,
				},
				get() {
					const value = this.getDataValue("nb_avis");
					return value;
				},
				set(value) {
					if (typeof value === "number") {
						this.setDataValue("nb_avis", `${value} avis`);
					} else {
						this.setDataValue("nb_avis", value);
					}
				},
			},
			price: {
				type: DataTypes.INTEGER,
				allowNull: true,
				validate: {
					min: 0,
				},
			},
      auctionPrice: {
				type: DataTypes.INTEGER,
				allowNull: true,
				validate: {
					min: 0,
				},
			},
			postId: {
				type: DataTypes.INTEGER,
				allowNull: true,
				references: {
					model: "post",
					key: "id",
				},
			},
		},
		{
			tableName: "synthetisers",
			timestamps: true,
		}
	);

	synthetiser.associate = (models) => {

		synthetiser.hasMany(models.post, {
			foreignKey: "synthetiserId",
			as: "posts", // permet d'utiliser synthetiser.getPosts()
		});
    
	};

	return synthetiser;
};

export default initModel;
