const { mysql } = require('config')
const Sequelize = require('sequelize')

const path = require('path')
const fs = require('fs')
const humps = require('humps')
const _ = require('lodash')

const logger = require('./logger')


let models = {}

const loadModels = (filePath, db) => {
  const files = fs.readdirSync(filePath)

  files.forEach(file => {
    const filename = file.split('.')[0];
    const ext = path.extname(file)
    if (ext === '.js') {
      var model = db.import(path.join(filePath, filename))
      models[humps.pascalize(model.name)] = model;
    }
  });
}

const modelsPath = path.resolve(path.join(__dirname, 'sequelize-models'))


const db = new Sequelize(Object.assign(mysql.options, {
  host: mysql.host,
  port: mysql.port,
  username: mysql.user,
  password: mysql.password,
  database: mysql.database,
  logging: sql => {
    // logger.trace("sql", sql)
  }
}))

const selectOne = async(sql, params) => {
  return await selectAll(sql, params).then(_.first)
}

const selectAll = async(sql, params) => {
  return await db.query(sql, { replacements: params, type: Sequelize.QueryTypes.SELECT })
}


const execute = async(sql, params) => {
  return await db.query(sql, { replacements: params }).spread((results, metadata) => {
    return results
  }).catch(err => {
    logger.error("execute sql error", sql, params, err)
  })
}

loadModels(modelsPath, db)


module.exports = {
  db,
  models,
  execute,
  selectOne,
  selectAll,
}

