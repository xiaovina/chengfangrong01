const combineRouters= require('koa-combine-routers')
const _ = require('lodash')


const logger = require('../logger');


let routerList = [
  require('./lottery'),
]

logger.info("======================routers=============================")
for (let router of routerList) {
  router.stack.map(it => {
    logger.info("methods:%s : %s", _.without(it.methods, 'HEAD', 'OPTIONS'), it.path)
  })
}
logger.info("======================routers=============================")

const routers = combineRouters(routerList)

module.exports = routers
