import { Sequelize } from 'sequelize';
import Role from '../models/role.js';
import config from '../config/config.js';

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  dialect: dbConfig.dialect
});

const roles = [
  { name: 'admin', description: 'Administrateur avec tous les droits' },
  { name: 'user', description: 'Utilisateur standard' },
  { name: 'moderator', description: 'Modérateur avec des droits étendus' },
  { name: 'owner', description: 'Modérateur avec des droits étendus' },
  { name: 'creator', description: 'Modérateur avec des droits étendus' }
];

async function createRoles() {
  try {
    await sequelize.sync();

    const createdRoles = await Role.bulkCreate(roles, {
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

