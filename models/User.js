export const initModel = (sequelize, DataTypes) => {
	const User = sequelize.define(
		"User",
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
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
				validate: {
					isEmail: true,
				},
			},
			password: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			has_instrument: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			age: {
				type: DataTypes.INTEGER,
			},
            roleId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                // Supprimé defaultValue: 1
                // À la place, utilisons un hook beforeCreate
            },
        },
        {
            tableName: "users",
            timestamps: true,
            hooks: {
				beforeCreate: async (user) => {
                    // Si roleId n'est pas défini, le calculer à partir de has_instrument
                    if (!user.roleId) {
                        user.roleId = user.has_instrument ? 5 : 1;
                    }
                },

                beforeUpdate: async (user) => {
                    const role = await user.getRole();
                    const isAuthorized =
                        role.role_name === "admin" || role.role_name === "owner_instr";
                    if (!isAuthorized && user.changed("price")) {
                        throw new Error(
                            "Seuls les administrateurs et les propriétaires d'instruments peuvent modifier le prix"
                        );
                    }
                },
            },
        }
    );

	User.associate = (models) => {
		// Association avec AuctionPrice
		if (models.AuctionPrice) {
			User.hasMany(models.AuctionPrice, {
				foreignKey: "userId",
				as: "auctionPrice",
				tableName: "auction_prices", // Ajout du nom de table explicite
			});
		}

		// Association avec Role
		if (models.Role) {
			User.belongsTo(models.Role, {
				foreignKey: "roleId",
				as: "role",
				onDelete: "RESTRICT",
				onUpdate: "CASCADE",
				references: {
					model: "roles", // Nom de la table en minuscules
					key: "id",
				},
			});
		}

		// Association avec Post
		if (models.Post) {
			User.hasMany(models.Post, {
				foreignKey: "userId",
				as: "posts",
				references: {
					model: "posts", // Nom de la table en minuscules
					key: "id",
				},
			});
		}

		if (models.Profile) {
			User.hasOne(models.Profile, {
				foreignKey: "userId",
				as: "profile",
				references: {
					model: "profiles",
					key: "id",
				},
			});
		}
	};

	return User;
};

export default initModel;
