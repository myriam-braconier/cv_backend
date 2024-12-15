import { Model, DataTypes } from "sequelize";

export default function(sequelize) {
  class Synthetiser extends Model {
    static associate(models) {
		
      // Synthetiser.belongsTo(models.User, { foreignKey: 'userId' });
    }
  }

  Synthetiser.init(
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
          isValidSpecification(value) {
            const pattern = /^(\d{4}) • ([\w\s]+) • (Analogique|Numérique) • (\d+) oscillateur[s]? • (\d+) enveloppe[s]? • (\d+) filtre[s]? • (\d+) lfo[s]? • (Monophonique|Polyphonique) • (Monotimbral|Multitimbral) • Synthèse: (Soustractive|Additive|FM|Granulaire)$/;
            if (!pattern.test(value)) {
              throw new Error('Le format des spécifications est invalide');
            }
          }
        }
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
      auctionPrice: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: 0,
        },
      },
    },
    {
      sequelize,
      modelName: "Synthetiser",
      tableName: "synthetisers",
      timestamps: true,
    }
  );

  return Synthetiser;
}












