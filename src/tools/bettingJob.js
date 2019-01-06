const bettingService = require('../api/bettingService');
const logger = require('../logger');
const moment = require('moment');

const sleep = async(ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}
const run = async() => {
  let interval = 30000;
  const defaultInterval = 30000;
  while (true) {
    try {
      interval = defaultInterval;
      const before = new moment();
      await dealLog();
      const configs = await bettingService.getAvalibalConfig();
        if (configs && configs.length > 0) {

        for (let config of configs) {
          await dealJob(config);
        }
      } else {
        logger.info('no pending job');
      }
      const end = new moment();
      interval = interval - Number(end - before);
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


const dealLog = async() => {
  const job = await bettingService.getOneUnDealLog();
  if (job && job.config) {
    const config = job.config;

    const record = await bettingService.getLotteryRecord(job.recordTime);

    const dxdsArray = ['大', '小', '单', '双'];
    const one2NineArray = ['0','1','2','3','4','5','6','7','8','9'];
    const configEx = JSON.parse(config.config);

    if (record && record.danshuang) {
      let isWin = false;
      if (dxdsArray.includes(configEx.item)) {
        isWin = (configEx.item == record.daxiao) || (configEx.item == record.danshuang);
      } else if (one2NineArray.includes(configEx.item)) {
        let item = record.result % 10;
        isWin = item == configEx.item;

      }
      isWin = isWin ? 1: 0;
      await bettingService.dealOneLog(job.id, record.result, isWin);
    }
  }
}

run()
