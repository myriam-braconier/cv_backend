export const initModel = (sequelize, DataTypes) => {
	const user = sequelize.define(
		"user", {
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
			},
			password: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			has_instrument: {
				type: DataTypes.BOOLEAN,
			},
			age: {
				type: DataTypes.INTEGER,
			}
		}, {
			tableName: "users",
			timestamps: true,
		}
	);

	user.associate = (models) => {
		user.belongsToMany(models.role, {
			through: "UserRoles", // Nom de la table de jonction
			foreignKey: "UserId",
			otherKey: "RoleId",
		});
	};

	return user;
};

export default initModel;
