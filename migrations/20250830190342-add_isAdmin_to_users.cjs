'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn('users', 'isAdmin', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.removeColumn('users', 'isAdmin');
  }
};
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn('users', 'isAdmin', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.removeColumn('users', 'isAdmin');
  }
};
