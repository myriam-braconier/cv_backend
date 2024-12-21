export const initModel = (sequelize, DataTypes) => {
  const Synthetiser = sequelize.define(
    "Synthetiser", // Majuscule pour le nom du modèle
    {
      marque: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      modele: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      specifications: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          isValidSpecification(value) {},
        },
      },
      image_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      note: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          is: /^[0-9]{1,3}%$/,
        },
        get() {
          return this.getDataValue("note");
        },
        set(value) {
          this.setDataValue("note", value);
        },
      },
      nb_avis: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          is: /^[0-9]+ avis$/,
        },
        get() {
          const value = this.getDataValue("nb_avis");
          return value;
        },
        set(value) {
          if (typeof value === "number") {
            this.setDataValue("nb_avis", `${value} avis`);
          } else {
            this.setDataValue("nb_avis", value);
          }
        },
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
          min: 0,
        },
        get() {
          const value = this.getDataValue('price');
          return value === null ? null : parseFloat(value);
        }
      },
      auctionPrice: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: 0,
        },
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Users", // Majuscule
          key: "id",
        },
      },
      postId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Posts", // Majuscule
          key: "id",
        },
      },
    },
    {
      tableName: "synthetisers",
      timestamps: true,
      hooks: {
        beforeUpdate: async (synthetiser, options) => {
          if (synthetiser.changed("price")) {
            const updatingUser = options.user;
            const owner = await synthetiser.getUser();
            
            if (!updatingUser || updatingUser.id !== owner?.id) {
              throw new Error("Seul le propriétaire peut modifier le prix");
            }
          }
        },
      },
    }
  );

  Synthetiser.associate = (models) => {
    console.log('Modèles disponibles:', Object.keys(models));
    
    // Relation avec AuctionPrice
    if (models.AuctionPrice) {
      Synthetiser.hasMany(models.AuctionPrice, {
        foreignKey: "synthetiserId",
        as: "auctionPrices"
      });
    }

    // Relation avec User
    if (models.User) {
      Synthetiser.belongsTo(models.User, {
        foreignKey: "userId",
        as: "owner"
      });
    }

    // Relation avec Post
    if (models.Post) {
      Synthetiser.hasMany(models.Post, {
        foreignKey: "synthetiserId",
        as: "posts"
      });
    }
  };

  return Synthetiser;
};

export default initModel;