export const initModel = (sequelize, DataTypes) => {
	const User = sequelize.define(
		"User",
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			isAdmin: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			username: {
				type: DataTypes.STRING,
				allowNull: false,
				validate: {
					notEmpty: true,
					len: [2, 50],
				},
			},
			email: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: {
					name: "users_email_unique",
					msg: "Cet email est déjà utilisé",
				},
				validate: {
					isEmail: {
						msg: "Format d'email invalide",
					},
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
			roleId: {
				type: DataTypes.INTEGER,
				allowNull: true,
				references: {
					model: "roles",
					key: "id",
				},
			},
			first_name: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			last_name: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			age: {
				type: DataTypes.INTEGER,
				allowNull: true,
				validate: {
					isInt: true,
					min: 0,
				},
			},
		},
		{
			tableName: "users",
			timestamps: true,
			hooks: {
				beforeCreate: async (user) => {
					if (!user.roleId) {
						user.roleId = user.has_instrument ? 5 : 1;
					}
				},
			},
		}
	);

	User.associate = (models) => {
		User.belongsTo(models.Role, {
			foreignKey: "roleId",
			as: "role",
			onDelete: "RESTRICT",
			onUpdate: "CASCADE",
		});

		if (models.Profile) {
			User.hasOne(models.Profile, {
				foreignKey: "userId",
				as: "profile",
			});
		}

		if (models.Post) {
			User.hasMany(models.Post, {
				foreignKey: "userId",
				as: "posts",
			});
		}

		if (models.AuctionPrice) {
			User.hasMany(models.AuctionPrice, {
				foreignKey: "userId",
				as: "auctionPrice",
			});
		}
	};

	return User;
};

export default initModel;
