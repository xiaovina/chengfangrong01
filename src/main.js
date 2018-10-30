const eosSocketWSSClient = require('./api/eosSocketWSSClient')
const logger = require('./logger')
const run = async() => {
  try {
    logger.info('Start!');
    eosSocketWSSClient.dealWs();
  } catch (err) {
    logger.error(err);
  }
}

module.exports = {
  run,
}

run();
