const eosService = require('../api/eosLottery');
const bettingService = require('../api/bettingService');
const logger = require('../logger');


const run = async() => {
  logger.info("process start...");

  try {
    const config = {
      config: "{\"oneHour\":\"2\",\"beforeOneHour\":\"10\",\"bettingTimes\":\"120\",\"maxWinTimes\":\"5\",\"amount\":\"5.0000\",\"item\":\"2\",\"memo\":\"lottery:b\"}",
      frequencyId: '1544021208609'
    }
    // await bettingService.checkStart(config);
    // await bettingService.checkStop(config);

    const latest = await eosService.GetLatest(1);
    dealLogJob(latest[0], config )
  } catch (err) {
    logger.error(err);
  }

  process.exit();
  logger.info("process done")
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

