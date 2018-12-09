module.exports = function(sequelize, DataTypes) {
	return sequelize.define('BettingLog', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		frequencyId: {
			type: DataTypes.STRING(200),
			allowNull: false
		},
    config: {
      type: DataTypes.JSON,
      allowNull: false
		},
		configId: {
			type: DataTypes.INTEGER(11),
			allowNull: false
    },
    result: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		},
		isWin: {
			type: DataTypes.INTEGER(1),
			allowNull: true
		},
		isDeal: {
			type: DataTypes.INTEGER(1),
			allowNull: true
		},
		eos: {
      type: DataTypes.JSON,
      allowNull: true
		},
		transaction: {
      type: DataTypes.JSON,
      allowNull: true
		},
		recordTime: {
			type: DataTypes.DATE,
			allowNull: true
		},
		updatedAt: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
		},
    createdAt: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
		}
  }, {
		tableName: 'BettingLog',
		timestamps: false,
		underscored: false
	})
}
