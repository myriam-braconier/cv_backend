export const initModel = (sequelize, DataTypes) => {
  const adminActionLog = sequelize.define(
		"adminActionLog",
    {
      adminId: {
        type: sequelize.Sequelize.INTEGER,
        allowNull: false
      },
      action: {
        type: sequelize.Sequelize.STRING,
        allowNull: false
      },
      targetUserId: {
        type: sequelize.Sequelize.INTEGER,
        allowNull: false
      },
      timestamp: {
        type: sequelize.Sequelize.DATE,
        defaultValue: sequelize.Sequelize.NOW
      }
    },
    {
      modelName: "AdminActionLog"
    }
  );

  adminActionLog.associate = (models) =>  {
    adminActionLog.belongsTo(models.user, {
      as: 'admin',
      foreignKey: 'adminId'
    });
}
  return adminActionLog;
};

export default initModel;