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
                    model: 'Roles',
                    key: 'id'
                }
            }
        },
        {
            tableName: "users",
            timestamps: true,
        }
    );

    User.associate = (models) => {
        // Association avec AuctionPrice
        if (models.AuctionPrice) {
            User.hasMany(models.AuctionPrice, {
                foreignKey: "userId",
                as: "auctionPrice"
            });
        }

        // Association avec Role
        if (models.Role) {
            User.belongsTo(models.Role, {
                foreignKey: "roleId",
                as: "role",
                onDelete: 'RESTRICT',
                onUpdate: 'CASCADE'
            });
        }

        // Association avec Post
        if (models.Post) {
            User.hasMany(models.Post, {
                foreignKey: "userId",
                as: "posts"
            });
        }
    };

    return User;
};

export default initModel;