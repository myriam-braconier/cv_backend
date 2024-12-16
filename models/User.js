import { Model, DataTypes } from "sequelize";

export default function(sequelize) {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Post, { foreignKey: "userId" });
      User.belongsToMany(models.Role, { 
        through: "UserRoles",
        foreignKey: 'userId',
        otherKey: 'roleId'
      });
      User.hasOne(models.Profile, { foreignKey: "userId" });
    }
  }

  User.init(
    {
      userName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Un nom d\'utilisateur est requis'
          }
        }
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
          len: [9], // Longueur minimale et maximale du mot de passe
        },
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
      timestamps: true,
      // hooks: {
      //   beforeCreate: (user) => {
      //     user.password = bcrypt.hashSync(user.password, 9);
      //   },
      // },
    }
  );

  return User;
}
