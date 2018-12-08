const bettingService = require('../api/bettingService');
const logger = require('../logger');

const sleep = async(ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}
const run = async() => {
  const defaultInterval = 60 * 1000
  while (true) {
    try {
      const configs = await bettingService.getAvalibalConfig();
        if (configs && configs.length > 0) {

        for (let config of configs) {
          await dealJob(config);
        }
      } else {
        logger.info('no pending job');
      }
    } catch (e) {
      logger.error(e)
    }

    logger.info('finished betting jobs')

    await sleep(defaultInterval)
    logger.debug(`auto betting jobs after ${defaultInterval / 1000} seconds`)

  }
}

// 根据配置决定启用哪个job
const dealJob = async(config) => {
  if (config) {
    switch(config.status) {
      case 0: // New
        await dealNewJob(config);
        break;
      case 1: // Betting
        await dealBettingJob(config);
        break;
      case 2: // Pause
        break;
    }
  }
}

const dealNewJob = async(config) => {
  const start = await bettingService.checkStart(config);
  if (start) {
    await bettingService.updateConfigStatus(config.id, 1);
  }
}

const dealBettingJob = async(config) => {
  let stop = await bettingService.checkStop(config);
  if (stop) {
    await bettingService.updateConfigStatus(config.id, 0);
  }
}

run()
