const realTimeService = require('../api/realTime');
const logger = require('../logger');


const run = async() => {
  logger.info("process start...");

  try {
    // const list = await realTimeService.getData('dxds',60,'2018-11-01 09:00:14', '2018-11-01 09:02:14');
    // logger.debug(list);

    const list09 = await realTimeService.getData('09',60,'2018-11-01 09:00:14', '2018-11-01 09:02:14');
    logger.debug(list09);


  } catch (err) {
    logger.error(err);
  }
  process.exit();
  logger.info("process done")
}


run()

