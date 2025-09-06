// fix-database.js
const { Sequelize } = require('sequelize');
const DATABASE_URL = "mysql://root:qdgXpKVHDkzpKANvAMSSySJGCgTcjWKm@mysql.railway.internal:3306/railway"
// Connexion avec votre DATABASE_URL Railway
const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'mysql',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    },
connectTimeout: 60000,
    acquireTimeout: 60000,
    timeout: 60000,
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  logging: console.log
});

async function addIsAdminColumn() {
  try {
    console.log('🔄 Connexion à la base de données...');
    await sequelize.authenticate();
    console.log('✅ Connecté à la base de données');

    console.log('🔄 Ajout de la colonne isAdmin...');
    await sequelize.query(`
      ALTER TABLE users 
      ADD COLUMN isAdmin BOOLEAN DEFAULT FALSE
    `);
    
    console.log('✅ Colonne isAdmin ajoutée avec succès !');
    
    // Vérification
    const [results] = await sequelize.query('DESCRIBE users');
    console.log('📋 Structure de la table users :');
    console.table(results);
    
  } catch (error) {
    if (error.message.includes('Duplicate column name')) {
      console.log('ℹ️  La colonne isAdmin existe déjà');
    } else {
      console.error('❌ Erreur:', error.message);
    }
  } finally {
    await sequelize.close();
    console.log('🔒 Connexion fermée');
  }
}

addIsAdminColumn();