export const initAboutModel = (sequelize, DataTypes) => {
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
    }
  );
  return About;
};

export default initAboutModel;