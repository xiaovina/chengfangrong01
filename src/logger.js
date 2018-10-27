const { colorConsole } = require('tracer')
const config = require('config')
const log = colorConsole(config.log.level)

class Logger {

  constructor() {}
  debug() {
    log.debug(...arguments)
  }
  info() {
    log.info(...arguments)
  }
  trace() {
    log.trace(...arguments)
  }
  warn() {
    log.warn(...arguments)
  }
  notice() {
    log.debug(...arguments)
  }
  error() {
    log.error(...arguments)
  }
}

const logger = new Logger()

module.exports = logger

