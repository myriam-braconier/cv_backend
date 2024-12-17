/**
* Constantes des permissions système
* @readonly
* @enum {string}
*/
export const PERMISSIONS = {
  // Permissions liées aux posts
  CREATE_POST: 'create_post',
  EDIT_POST: 'edit_post',
  DELETE_POST: 'delete_post',

  // Permissions administratives
  MANAGE_USERS: 'manage_users',
  MANAGE_ROLES: 'manage_roles'
};

// Figer l'objet pour empêcher toute modification
Object.freeze(PERMISSIONS);
