const logger = require('./logger');

const run = async() => {
  try {
    logger.info('Start!');
  } catch (err) {
    logger.error(err);
  }
}

module.exports = {
  run,
}

run();
