import db from '../models/index.js'; // chemin vers le dossier où Sequelize est initialisé

const testUserPermissions = async (userId) => {
  const user = await db.User.findOne({
    where: { id: userId },
    include: [
      {
        model: db.Role,
        as: 'role',
        include: [
          {
            model: db.Permission,
            as: 'permissions'
          }
        ]
      }
    ]
  });
  console.log('User:', user.username);
  console.log('Role:', user.role?.name);
  console.log('Permissions:', user.role?.permissions.map(p => p.name));
};

testUserPermissions(70).then(() => process.exit()).catch(console.error);
