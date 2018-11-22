const _ = require('lodash')
const moment = require('moment');
const logger = require('../logger')
const db = require('../db')
// const { RealTimeDXDS, RealTime09 } = db.models

class RealTime {
  constructor() { }

  async getData(x, slice, start, end) {
    let result = [];
    let table;
    const dateStart = moment(moment(start).add(-1, 'm').toDate());
    const dateEnd = moment(moment(end).add(1, 'm').toDate());
    let limit = dateEnd.diff(dateStart) / 60000; // millisecond to minuet
    logger.debug('limit:', limit);

    if (x === "dxds") {
      table = 'RealTimeDXDS';
      limit *= 4;
    } else {
      table = 'RealTime09';
      limit *= 10;
    }
    const sql = `
      select * from ${table}
        where
        slice = :slice
        order by id desc
        limit :limit;
        `;
    const list = await db.selectAll(sql, {slice, limit});
    if (x === "dxds") {
      const dxdsArray = ['大', '小', '单', '双'];
      dxdsArray.forEach(element => {
        let item = { label:'', data:[] };

        let part = _.filter(list, ['x', element]);
        part = part.reverse();
        logger.debug(part);

        item.label = element;
        item.data = part.map(it => it.probability);
        result.push(item);
      });
    } else {
      for (let i = 0; i < 10; ++i) {
        let item = { label:'', data:[] };
        let part = _.filter(list, ['x', i.toString()]);
        part = part.reverse();
        logger.debug(part);

        item.label = i;
        item.data = part.map(it => it.probability);
        result.push(item);
      }
    }

    return result;
  }
}


const realTime = new RealTime()
module.exports = realTime
