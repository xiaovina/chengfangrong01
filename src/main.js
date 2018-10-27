const eosSocketWSSClient = require('./api/eosSocketWSSClient')
const logger = require('./logger')
const run = async() => {
  try {
    logger.info('Start!');
    eosSocketWSSClient.deal();
    process.on('uncaughtException', function(err) {
      // handle the error safely
      logger.error("uncaughtException", err);
    })
  } catch (err) {
    logger.error(err);
  }
}

module.exports = {
  run,
}

run();
