const eosLottery = require('../api/eosLottery');
const logger = require('../logger');

const run = async() => {
  logger.info("process start...");

  try {
    const list = await eosLottery.GetList('2018-11-01 09:00:14', '2018-11-01 09:59:14');
    logger.debug(list);
    // await eosLottery.dealAnalizy(list, '大');
    // await eosLottery.dealAnalizy(list, '小');
    // await eosLottery.dealAnalizy(list, null, '单');
    // await eosLottery.dealAnalizy(list, null, '双');

    // await eosLottery.dealAnalizyAll(list);

    const l = await eosLottery.dealTopXX(20);
    logger.info(l);
  } catch (err) {
    logger.error(err);
  }
  process.exit();
  logger.info("process done")
}


run()

