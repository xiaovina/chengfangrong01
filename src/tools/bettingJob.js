const bettingService = require('../api/bettingService');
const logger = require('../logger');

const sleep = async(ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}
const run = async() => {
  let interval = 1 * 1000
  const defaultInterval = 10 * 1000
  const maxInterval = 10 * 1000

  while (true) {
    try {
      const configs = await bettingService.getAvalibalConfig();
        if (configs && configs.length > 0) {
        interval = defaultInterval;

        for (let config of configs) {
          await dealJob(config);
        }
      } else {
        logger.info('no pending job')
        interval = interval * 2
        if (interval > maxInterval) {
          interval = maxInterval
        }
      }
    } catch (e) {
      logger.error(e)
    }

    logger.info('finished betting jobs')

    await sleep(interval)
    logger.debug(`auto betting jobs after ${interval / 1000} seconds`)

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
