export const initModel = (sequelize, DataTypes) => {
	const Synthetiser = sequelize.define(
		"Synthetiser", // Majuscule pour le nom du modèle
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
				type: DataTypes.DECIMAL(10, 2),
				allowNull: true,
				validate: {
					min: 0,
				},
				get() {
					const value = this.getDataValue("price");
					return value === null ? null : parseFloat(value);
				},
				set(value) {
					if (typeof value === 'object' && value.value) {
					  this.setDataValue('price', value.value);
					} else {
					  this.setDataValue('price', value);
					}
				  }
			},
			auctionPriceId: {
				type: DataTypes.INTEGER,
				allowNull: true,
				references: {
					model: "auction_prices", 
					key: "id",
				},
			},
			userId: {
				type: DataTypes.INTEGER,
				allowNull: true,
				references: {
					model: "users", 
					key: "id",
				},
			},
			postId: {
				type: DataTypes.INTEGER,
				allowNull: true,
				references: {
					model: "posts", 
					key: "id",
				},
			},
		},
		{
			tableName: "synthetisers",
			timestamps: true,
			hooks: {

				beforeUpdate: async (synthetiser, options) => {
					try {
						if (options?.fields?.includes("price") || synthetiser.changed("price") ||
							options?.fields?.includes("auctionPrice") || synthetiser.changed("auctionPrice")) {
							
							if (!options?.user) {
								console.log("Pas d'utilisateur spécifié, mise à jour autorisée");
								return;
							}
				
							if (!synthetiser.userId) {
								console.log("Pas de propriétaire défini, mise à jour autorisée");
								return;
							}
				
							const owner = await sequelize.models.User.findByPk(synthetiser.userId);
							if (!owner) {
								console.log("Propriétaire non trouvé, mise à jour autorisée");
								return;
							}
				
							if (options.user.id !== owner.id) {
								throw new Error("Seul le propriétaire peut modifier le prix");
							}
						}
					} catch (error) {
						console.error("Erreur dans beforeUpdate:", error);
						throw error;
					}
				}
				

			},
		}
	);

	Synthetiser.associate = (models) => {
		console.log("Modèles disponibles:", Object.keys(models));



		 // Relation avec User
		 if (models.User) {
			Synthetiser.belongsTo(models.User, {
				foreignKey: "userId",
				as: "owner"
			});
		}

		// Relation avec AuctionPrice
		if (models.AuctionPrice) {
			Synthetiser.hasMany(models.AuctionPrice, {
				foreignKey: "synthetiserId",
				as: "auctionPrices",
			});
		}


		// Relation avec Post
		if (models.Post) {
			Synthetiser.hasMany(models.Post, {
				foreignKey: "synthetiserId",
				as: "posts",
			});
		}


	};

	return Synthetiser;
};

export default initModel;
