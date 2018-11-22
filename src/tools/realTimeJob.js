const eosLotteryServices = require('../api/eosLottery');
const moment = require('moment');
const logger = require('../logger');
const db = require('../db')
const { RealTimeDXDS, RealTime09 } = db.models

const sleep = async(ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}
const run = async() => {
  const interval = 60 * 1000
  const slice = [60, 120] // min
  while (true) {
    try {
      const oneHourDxds = await eosLotteryServices.GetSliceRandomProbability(slice[0]);
      const twoHourDxds = await eosLotteryServices.GetSliceRandomProbability(slice[1]);
      await save(oneHourDxds, slice[0], 'dxds');
      await save(twoHourDxds, slice[1], 'dxds');

      const oneHour09 = await eosLotteryServices.GetSlice09RandomProbability(slice[0]);
      const twoHour09 = await eosLotteryServices.GetSlice09RandomProbability(slice[1]);
      await save(oneHour09, slice[0], '09');
      await save(twoHour09, slice[1], '09');

    } catch (e) {
      logger.error(e)
    }
    logger.info('finished sync job')

    await sleep(interval)
    // logger.debug(`fetch sync job after ${interval / 1000} seconds`)
  }
}

const save = async(list, slice, type) => {
  const recordTime = new moment().second(0).millisecond(0);
  if (type === 'dxds') {
    for (let item of list) {
      const model = {
        x: item.dxds,
        probability: item.p,
        recordTime,
        slice
      };
      await RealTimeDXDS.create(model)
    }
  } else if (type === '09'){
    for (let x in list) {
      const model = {
        x,
        probability: list[x],
        recordTime,
        slice
      };
      await RealTime09.create(model)
    }
  }
}

run()
