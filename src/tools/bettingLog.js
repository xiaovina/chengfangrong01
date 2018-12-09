const moment = require('moment');
const bettingService = require('../api/bettingService');
const eosService = require('../api/eosLottery');
const eosClient = require('../api/eosClient');
const logger = require('../logger');

const sleep = async(ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}
const run = async() => {
  let interval = 60000;
  const defaultInterval = 60000;

  while (true) {
    try {
      interval = defaultInterval;
      const before = new moment();
      const configs = await bettingService.getPendingConfig();
      if (configs && configs.length > 0) {
        for (let config of configs) {
          logger.info("config", config);
          if (config.isReal) {
            logger.info("isReal", config.isReal);
            const transferResult = await dealBetting(config);
            // real log
            await createLog(config, transferResult);
          } else {
            // unreal log
            await createLog(config);
          }
        }
      } else {
        logger.info('no pending betting log job');
      }
      const end = new moment();
      interval = interval - Number(end - before);

    } catch (e) {
      logger.error(e);
    }

    logger.info('finished betting log jobs');

    await sleep(interval);
    logger.debug(`auto betting log jobs after ${interval / 1000} seconds`);
  }
}

const dealBetting = async(config) => {
  const configEx = JSON.parse(config.config);
  return await eosClient.transferCommon(config.privateKey, config.username, configEx.toUserName, configEx.amount, configEx.memo);
}

const createLog = async(config, transaction=null) => {
  let log;
  if (transaction) {
    log = {
      configId: config.id,
      config: config,
      frequencyId: config.frequencyId,
      result: 0,
      eos: {},
      transaction: transaction,
      recordTime: moment(transaction.processed.block_time),
      isWin: 0,
      isDeal: 0,
    }
  } else {
    log = {
      configId: config.id,
      config: config,
      frequencyId: config.frequencyId,
      result: 0,
      eos: {},
      transaction: {},
      recordTime: new moment(),
      isWin: 0,
      isDeal: 0,
    }
  }
  await bettingService.createLog(log);
}

run()
