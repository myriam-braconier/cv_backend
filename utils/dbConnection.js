
const { sequelize } = require('../models');  // Adaptez le chemin selon votre structure

const withConnection = async (callback) => {
    const connection = await sequelize.connectionManager.getConnection();
    try {
        const result = await callback(connection);
        return result;
    } finally {
        await sequelize.connectionManager.releaseConnection(connection);
    }
};

const checkConnections = async () => {
    try {
        const [results] = await sequelize.query('SHOW PROCESSLIST');
        console.log('Connexions actives:', results.length);
        console.log('Détails des connexions:', results);
        return results;
    } catch (error) {
        console.error('Erreur vérification connexions:', error);
        throw error;
    }
};

module.exports = { withConnection, checkConnections };