const moment = require('moment');
const logger = require('../logger');
const bettingService = require('../api/bettingService');


const run = async() => {
  logger.info("process start...");

  try {
    // let recordTime = '2018-12-09 06:58:28';
    // let before = moment(recordTime);
    // logger.debug('before', before);

    // before = before.second(0).millisecond(0);
    // logger.debug('before x', before);


    // const end = before.add(1, 'm').toDate();
    // logger.debug('end', end);

    await dealLog();


  } catch (err) {
    logger.error(err);
  }
  process.exit();
  logger.info("process done")
}

const dealLog = async() => {
  const job = await bettingService.getOneUnDealLog();
  const config = job.config;

  const record = await bettingService.getLotteryRecord(job.recordTime);

  const dxdsArray = ['大', '小', '单', '双'];
  const one2NineArray = ['0','1','2','3','4','5','6','7','8','9'];
  const configEx = JSON.parse(config.config);

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

run()

