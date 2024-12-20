export const initModel = (sequelize, DataTypes) => {
  const AdminActionLog = sequelize.define(
		"AdminActionLog",
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

  AdminActionLog.associate = (models) =>  {

    if (models.User) {
    AdminActionLog.belongsTo(models.User, {
      as: 'admin',
      foreignKey: 'adminId'
    });
  }
}
  return AdminActionLog;
};

export default initModel;