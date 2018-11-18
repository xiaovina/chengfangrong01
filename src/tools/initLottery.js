const eosLottery = require('../api/eosLottery');
const logger = require('../logger');

const run = async() => {

  if (!process.argv || !process.argv[2]) {
    logger.error("ERROR! The Newest GameId is Required!");
    process.exit()
  }

  try {
    const lower = Number(process.argv[2]) - 1;
    await eosLottery.InitLottery(lower);
  } catch (err) {
    logger.error("InitLottery", err);
  }
  process.exit()
}


run()

