module.exports = function(sequelize, DataTypes) {
	return sequelize.define('BettingConfig', {
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
		status: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		},
		username: {
			type: DataTypes.STRING(200),
			allowNull: false
		},
		privateKey: {
			type: DataTypes.STRING(200),
			allowNull: false
		},
		isReal: {
			type: DataTypes.INTEGER(1),
			allowNull: false
		},
    createdAt: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
		},
		updatedAt: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
		}
  }, {
		tableName: 'BettingConfig',
		timestamps: false,
		underscored: false
	})
}
