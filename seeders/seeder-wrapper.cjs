const path = require('path');
const { pathToFileURL } = require('url');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const moduleUrl = pathToFileURL(path.resolve(__dirname, './20241217202353-permissionSeeder.js'));
    const module = await import(moduleUrl);
    return module.up(queryInterface, Sequelize);
  },
  down: async (queryInterface, Sequelize) => {
    const moduleUrl = pathToFileURL(path.resolve(__dirname, './20241217202353-permissionSeeder.js'));
    const module = await import(moduleUrl);
    return module.down(queryInterface, Sequelize);
  }
};
