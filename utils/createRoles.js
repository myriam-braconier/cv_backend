import { Sequelize } from 'sequelize';
import config from '../config/config.js';
import defineRoleModel from '../models/role.js';

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  dialect: dbConfig.dialect
});

// Définissez le modèle Role en passant l'instance sequelize
const Role = defineRoleModel(sequelize);

const roles = [
  { name: 'admin', description: 'Administrateur avec tous les droits' },
  { name: 'user', description: 'Utilisateur standard' },
  { name: 'moderator', description: 'Modérateur avec des droits étendus' },
  { name: 'owner', description: 'Propriétaire' },
  { name: 'creator', description: 'Créateur' }
];

async function createRoles() {
  try {
    await sequelize.authenticate();
    console.log('Connexion à la base de données établie avec succès.');
    
    await sequelize.sync();

    const createdRoles = await Role.bulkCreate(roles, {
      validate: true,
      ignoreDuplicates: true,
      updateOnDuplicate: ['description']
    });

    console.log('Rôles créés ou mis à jour avec succès:', createdRoles.map(role => role.name));
  } catch (error) {
    console.error('Erreur lors de la création des rôles:', error);
  } finally {
    await sequelize.close();
  }
}

createRoles();
