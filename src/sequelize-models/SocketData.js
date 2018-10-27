module.exports = function(sequelize, DataTypes) {
	return sequelize.define('SocketData', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
    },
    type: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 0
    },
    blocknum: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: ''
    },
    time: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: ''
    },
    dataId: {
      type: DataTypes.STRING(500),
      allowNull: false,
      defaultValue: ''
    },
    data: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: ''
    },
		createdAt: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
		}
  }, {
		tableName: 'SocketData',
		timestamps: false,
		underscored: false
	})
}
