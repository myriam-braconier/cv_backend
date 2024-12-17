import { Sequelize } from "sequelize";
import config from "../config/config.js";
import dotenv from "dotenv";

dotenv.config();

const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];

const sequelize = new Sequelize(
	dbConfig.database,
	dbConfig.username,
	dbConfig.password,
	{
		host: dbConfig.host,
		dialect: dbConfig.dialect,
	}
);

try {
	await sequelize.authenticate();
	console.log("Connection établie.");
} catch (error) {
	console.error("Impossible de se connecter:", error);
}

const testConnection = async () => {
	try {
		await sequelize.authenticate();
		console.log("Database connected successfully");
	} catch (error) {
		console.error("Unable to connect to the database:", error);
	}
};

testConnection();

export default sequelize;
