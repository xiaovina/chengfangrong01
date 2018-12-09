const eosLottery = require('../api/eosLottery');
const logger = require('../logger');

const sleep = async(ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}
const run = async() => {
  let interval = 3 * 1000
  while (true) {
    try {
      await eosLottery.SyncNewestLottery();
    } catch (e) {
      logger.error(e)
    }
    // logger.info('finished sync job')

    await sleep(interval)
    // logger.debug(`fetch sync job after ${interval / 1000} seconds`)
  }
}

run()
