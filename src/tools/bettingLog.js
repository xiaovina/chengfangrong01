const bettingService = require('../api/bettingService');
const eosService = require('../api/eosLottery');
const eosClient = require('../api/eosClient');
const logger = require('../logger');

const sleep = async(ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}
const run = async() => {
  let interval = 60 * 1000

  while (true) {
    try {
      const configs = await bettingService.getPendingConfig();
        if (configs && configs.length > 0) {
        const latest = await eosService.GetLatest(1);
        for (let config of configs) {
          logger.info("config", config);
          if (config.isReal) {
            logger.info("isReal", config.isReal);
            dealBetting(config);
          }
          dealLogJob(latest[0], config);
        }
      } else {
        logger.info('no pending betting log job')
      }
    } catch (e) {
      logger.error(e)
    }

    logger.info('finished betting log jobs')

    await sleep(interval)
    logger.debug(`auto betting log jobs after ${interval / 1000} seconds`)
  }
}

const dealBetting = async(config) => {
  const configEx = JSON.parse(config.config);
  await eosClient.transfer(configEx.privateKey, configEx.username, configEx.amount, configEx.item);
}

const dealLogJob = async(latest, config) => {
  const configEx = JSON.parse(config.config);
  const isWin = (configEx.item === latest.daxiao) || (configEx.item === latest.danshuang);
  const log = {
    configId: config.id,
    config,
    result: latest.result,
    isWin :isWin ? 1 : 0,
    frequencyId: config.frequencyId,
    eos: latest,
  }
  await bettingService.createLog(log);
}

run()
