module.exports = {
  NODE_ENV: 'test',
  mysql : {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'DevTest',
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
  }
}
