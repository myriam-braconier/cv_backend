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
			},
			roleId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
				  model: 'roles',
				  key: 'id'
				}
			  }
		}, {
			tableName: "users",
			timestamps: true,
		}
	);

	user.associate = (models) => {

		user.belongsTo(models.role, {
            foreignKey: {
                name: "roleId",
				as: "role",  // Important : utilisez "role" au singulier
                allowNull: false
            },
			as: 'role', // Définition de l'alias
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });

		user.hasMany(models.post, {
			as: 'posts',  // Important pour générer les méthodes
			foreignKey: 'userId',
		});
	};


	

	return user;
};

export default initModel;
