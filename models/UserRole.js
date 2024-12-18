// models/UserRole.js
export const initModel = (sequelize, DataTypes) => {
  const userRole = sequelize.define('userRole', {
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    roleId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'roles',
        key: 'id'
      }
    }
  }, {
    tableName: 'userRoles',
    timestamps: true
  });

  return userRole;

};

// La table de jonction n'a pas besoin de définir les associations elle-même, car ce sont les modèles User et Role qui établissent leur relation many-to-many à travers cette table.

// Export par défaut de la fonction d'initialisation
export default initModel;
