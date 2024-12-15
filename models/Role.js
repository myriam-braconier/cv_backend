import { Model, DataTypes } from "sequelize";

class Role extends Model {
	static init(sequelize) {
		return super.init(
			{
				name: {
					type: DataTypes.STRING,
					allowNull: false,
					unique: {
						name: "unique_role_name",
					},
					// Supprime les index automatiques non nécessaires
					validate: {
						notNull: { msg: "Le nom du rôle est requis" },
						notEmpty: { msg: "Le nom du rôle ne peut pas être vide" },
					},
				},
				description: {
					type: DataTypes.TEXT,
					allowNull: true,
				},
				permission: {
					type: DataTypes.JSON,
					allowNull: false,
					defaultValue: {},
				},
			},

   
			{
				sequelize,
				modelName: "Role",
				tableName: "roles",
				timestamps: true,
			}


            
		);
	}

	static associate(models) {
        Role.belongsToMany(models.User, { 
          through: 'UserRoles',
          foreignKey: 'roleId',
          otherKey: 'userId'
        });
    }






}

export default Role;
