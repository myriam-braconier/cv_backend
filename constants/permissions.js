/**
 * Constantes des permissions système
 * @readonly
 * @enum {string}
 */
export const PERMISSIONS = {
  // Permissions utilisateurs
  USERS_READ: 'users:read',
  USERS_CREATE: 'users:create',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',

  // Permissions posts
  POSTS_READ: 'posts:read',
  POSTS_CREATE: 'posts:create',
  POSTS_UPDATE: 'posts:update',
  POSTS_DELETE: 'posts:delete',

  // Permissions synthétiseurs
  SYNTHS_READ: 'synths:read',
  SYNTHS_CREATE: 'synths:create',
  SYNTHS_UPDATE: 'synths:update',
  SYNTHS_DELETE: 'synths:delete',
  SYNTHS_BID: 'synths:bid',

  // Permissions auctions
  AUCTIONS_CREATE: 'auctions:create',
  AUCTIONS_READ: 'auctions:read',
  AUCTIONS_UPDATE: 'auctions:update',
  AUCTIONS_DELETE: 'auctions:delete',

  // Permissions rôles
  ROLES_READ: 'roles:read',
  ROLES_ASSIGN: 'roles:assign',
  ROLES_CREATE: 'roles:create',
  ROLES_DELETE: 'roles:delete',

  // Permissions admin
  ADMIN_ACCESS: 'admin:access',
  ADMIN_FULL: 'admin:full'
};

// Figer l'objet pour empêcher toute modification
Object.freeze(PERMISSIONS);