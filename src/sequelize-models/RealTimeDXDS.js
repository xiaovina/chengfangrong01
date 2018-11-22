module.exports = function(sequelize, DataTypes) {
	return sequelize.define('RealTimeDXDS', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
    },
    x: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: ''
    },
    probability: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: false,
      defaultValue: 0
    },
    recordTime: {
			type: DataTypes.DATE,
			allowNull: false
		},
		slice: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		},
    createdAt: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
		}
  }, {
		tableName: 'RealTimeDXDS',
		timestamps: false,
		underscored: false
	})
}
