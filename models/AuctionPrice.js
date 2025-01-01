// models/AuctionPrice.js
export const initModel = (sequelize, DataTypes) => {
    const AuctionPrice = sequelize.define(
        "AuctionPrice",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            proposal_price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            status: {
                type: DataTypes.ENUM("active", "won", "outbid", "cancelled"),
                defaultValue: "active",
            },
            synthetiserId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'synthetisers',
                    key: 'id',
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
        },
        {
            tableName: "auction_prices",
            timestamps: true,
        }
    );

    AuctionPrice.associate = (models) => {
        AuctionPrice.belongsTo(models.User, {
            foreignKey: "userId",
            as: "user",
            onDelete: "SET NULL",
            onUpdate: "CASCADE",
        });

        AuctionPrice.belongsTo(models.Synthetiser, {
            foreignKey: "synthetiserId",
            as: "synthetiser",
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        });
    };

    return AuctionPrice;
};

// Export par défaut de la fonction initModel
export default initModel;
