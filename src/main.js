const eosSocketWSSClient = require('./api/eosSocketWSSClient');
const eosLottery = require('./api/eosLottery');
const logger = require('./logger');

const run = async() => {
  try {
    logger.info('Start!');
    eosSocketWSSClient.dealWsEx();
  } catch (err) {
    logger.error(err);
  }
}

module.exports = {
  run,
}

run();
