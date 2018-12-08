const bettingService = require('../api/bettingService');
const eosService = require('../api/eosLottery');
const eosClient = require('../api/eosClient');
const logger = require('../logger');

const sleep = async(ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}
const run = async() => {
  const interval = 59500;

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
  await eosClient.transferCommon(config.privateKey, config.username, configEx.amount, configEx.memo);
}

const dealLogJob = async(latest, config) => {
  const dxdsArray = ['大', '小', '单', '双'];
  const one2NineArray = ['0','1','2','3','4','5','6','7','8','9'];
  const configEx = JSON.parse(config.config);

  let isWin = false;
  if (dxdsArray.includes(configEx.item)) {
    isWin = (configEx.item == latest.daxiao) || (configEx.item == latest.danshuang);
  } else if (one2NineArray.includes(configEx.item)) {
    let item = latest.result % 10;
    isWin = item == configEx.item;
  }

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
