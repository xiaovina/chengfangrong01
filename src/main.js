const logger = require('./logger');
const eosLottery = require('./api/eosLottery');


const run = async() => {
  try {
    logger.info('Start!');

    const list = await eosLottery.GetList('2018-11-01 09:00:14', '2018-11-01 09:59:14');
    logger.debug(list);
    const analizyResult1 = await eosLottery.dealAnalizy(list, '大');
    const analizyResult2 = await eosLottery.dealAnalizy(list, '小');
    const analizyResult3 = await eosLottery.dealAnalizy(list, null, '单');
    const analizyResult4 = await eosLottery.dealAnalizy(list, null, '双');

  } catch (err) {
    logger.error(err);
  }
}

module.exports = {
  run,
}

run();
