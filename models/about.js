
export const initAbout = (sequelize, DataTypes) => {
  const About = sequelize.define(
    "About",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false
      },
    },
    {
      tableName: 'abouts',  // Nom de la table dans la base de données
      timestamps: true      // Ajoute created_at et updated_at
    }
  );
  return About;
};

export default initAbout;