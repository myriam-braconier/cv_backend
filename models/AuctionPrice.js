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
		  type: DataTypes.DECIMAL(10, 2), // NUMBER n'existe pas, utilisez DECIMAL
		  allowNull: true,
		},
		status: {
		  type: DataTypes.ENUM('active', 'won', 'outbid', 'cancelled'),
		  defaultValue: 'active'
		},
		synthetiserId: {
		  type: DataTypes.INTEGER,
		  allowNull: false,
		  references: {
			model: "synthetisers", // Correction du nom de la table
			key: "id",
		  },
		},
		userId: { // Ajout explicite du champ userId
		  type: DataTypes.INTEGER,
		  allowNull: true,
		  references: {
			model: "users",
			key: "id",
		  },
		}
	  },
	  {
		tableName: "auctionPrices", 
		timestamps: true,
	  }
	);
  
	AuctionPrice.associate = (models) => {

		if (models.User) {
	  AuctionPrice.belongsTo(models.User, {
		foreignKey: "userId",
		as: "bidder"
	  });
	}
  
	if (models.Synthetiser) {
	  AuctionPrice.belongsTo(models.Synthetiser, {
		foreignKey: "synthetiserId",
		as: "synthetiser"
	  });
	};
}
	return AuctionPrice;
  };
  