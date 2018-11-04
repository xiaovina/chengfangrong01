const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const koaLogger = require('koa-logger')
const mount = require('koa-mount')
const serve = require('koa-static')
const path = require('path')
const _ = require('lodash')
const logger = require('./logger')

// logic
const routers = require('./routers')

const api = new Koa()
api.use(koaLogger())

api.use(async(ctx, next) => {
  try {
    await next();
  } catch (err) {
    logger.error(err, err.stack.split("\n"));
    if (err) {
      ctx.status = 500;
    }
  }
})

api.use(bodyParser())
api.use(routers)

// web
const adminApp = new Koa()
const adminDir = path.resolve(path.join(path.dirname(__dirname), 'web'))
adminApp.use(serve(adminDir))


const app = new Koa()
app.use(mount('/api/v1', api))
app.use(mount('/web/', adminApp))

module.exports = app
