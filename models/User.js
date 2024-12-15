import { Model, DataTypes } from "sequelize";

class User extends Model {
	static init(sequelize) {
		return super.init(
			{
				userName: {
					type: DataTypes.STRING,
					allowNull: false,
					unique: true,
					validate: {
						notEmpty: true,
					},
				},
				firstName: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				lastName: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				age: {
					type: DataTypes.INTEGER,
					allowNull: true,
					validate: {
						min: 0,
						max: 120,
					},
				},

				has_instrument: {
					type: DataTypes.BOOLEAN,
					allowNull: false,
					defaultValue: false,
				},

				password: {
					type: DataTypes.STRING,
					allowNull: false,
					validate: {
						notEmpty: true,
						len: [6, 100], // Longueur minimale et maximale du mot de passe
					},
				},
			},


			{
				sequelize,
				modelName: "User",
				tableName: "users",
				timestamps: true, // Ajoute createdAt et updatedAt
				hooks: {
					beforeCreate: (user) => {
						// hash de mot de passe (nécessite bcrypt)
						user.password = bcrypt.hashSync(user.password, 9);
					},
				},
			}

		);
	}


	static associate(models) {
		// Définissez vos associations ici
		User.hasMany(models.Post, { foreignKey: "userId" });
		User.belongsToMany(models.Role, { through: "UserRoles" });
		User.hasOne(models.Profile, { foreignKey: "userId" });
	}


}

export default User;
