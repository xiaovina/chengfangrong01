const eosService = require('../api/eosLottery');
const eosClient = require('../api/eosClient');
const bettingService = require('../api/bettingService');
const logger = require('../logger');
const moment = require('moment');


const run = async() => {
  logger.info("process start...");

  try {
    // const config = {
    //   config: "{\"oneHour\":\"2\",\"beforeOneHour\":\"10\",\"bettingTimes\":\"120\",\"maxWinTimes\":\"5\",\"amount\":\"0.1\",\"item\":\"2\",\"memo\":\"lottery:s\"}",
    //   frequencyId: '1544021208609',
    //   privateKey:'',
    //   username:'',
    // }
    // // await bettingService.checkStart(config);
    // // await bettingService.checkStop(config);
    // const configEx = JSON.parse(config.config);
    // await eosClient.transferCommon(config.privateKey, config.username, config.toUserName, configEx.amount, configEx.memo);

    const before = new moment();
    logger.info(before);
    await sleep(2000);
    const end = new moment();
    logger.info(end);
    logger.info(Number(end - before) + 10000);
  } catch (err) {
    logger.error(err);
  }

  process.exit();
  logger.info("process done")
}


const sleep = async(ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
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

