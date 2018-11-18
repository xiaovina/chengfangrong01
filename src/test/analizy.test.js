const eosLottery = require('../api/eosLottery');
const logger = require('../logger');
const variance = require('compute-variance');


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

    // const l = await eosLottery.dealTopXX(20);
    // logger.info(l);

    // const all = await eosLottery.dealAllProbability();
    // logger.debug(all)
    // const sp = await eosLottery.dealSliceProbability();
    // logger.debug(sp)

    // let allp1 = await eosLottery.GetAllProbability();
    // logger.debug(allp1);

    // let allp2 = await eosLottery.GetSliceProbability(2);
    // logger.debug(allp2);

    // let allRP1 = await eosLottery.GetSliceRandomProbability(13);
    // logger.debug(allRP1);

    let allp3 = await eosLottery.GetSlice09RandomProbability(2);
    logger.debug(allp3);


  } catch (err) {
    logger.error(err);
  }
  process.exit();
  logger.info("process done")
}


run()

