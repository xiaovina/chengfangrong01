module.exports = function(sequelize, DataTypes) {
	return sequelize.define('LotteryRecord', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
    },
    gameid: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 0
    },
    result: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 0
    },
    daxiao: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: ''
    },
    danshuang: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: ''
    },
		recordTime: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
		}
  }, {
		tableName: 'LotteryRecord',
		timestamps: false,
		underscored: false
	})
}
