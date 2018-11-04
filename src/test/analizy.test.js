const eosLottery = require('../api/eosLottery');
const logger = require('../logger');

const run = async() => {
  logger.info("process start...");

  try {
    const list = await eosLottery.GetList('2018-11-01 09:00:14', '2018-11-01 09:59:14');
    logger.debug(list);
    const analizyResult1 = await eosLottery.dealAnalizy(list, '大');
    const analizyResult2 = await eosLottery.dealAnalizy(list, '小');
    const analizyResult3 = await eosLottery.dealAnalizy(list, null, '单');
    const analizyResult4 = await eosLottery.dealAnalizy(list, null, '双');
  } catch (err) {
    logger.error(err);
  }
  logger.info("process done")
}


run()

