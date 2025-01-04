// models/about.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const About = sequelize.define('About', {
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
  // autres champs si nécessaire
});

export default About;