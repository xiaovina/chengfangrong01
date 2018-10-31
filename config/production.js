module.exports = {
  NODE_ENV: 'development',
  BASE_API: 'http://stock.snssdk.com/v1/quotes',
  mysql : {
    host: '72.11.147.201',
    port: 3306,
    user: 'root',
    password: 'Chengnet123',
    database: 'eosplay',
    charset: 'utf8mb4',
    timezone: 'UTC',
    options: {
      dialect: 'mysql',
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      timestamps: false,
      underscored: false,
      benchmark: true
    }
  },
  log: {
    level: 'debug',
  }
}