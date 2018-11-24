const _ = require('lodash')
const moment = require('moment');
const logger = require('../logger')
const db = require('../db')
// const { RealTimeDXDS, RealTime09 } = db.models

class RealTime {
  constructor() { }

  async getData(x, slice, start, end, limit) {
    let result = [];
    let table;
    if (x === "dxds") {
      table = 'RealTimeDXDS';
      limit *= 4;
    } else {
      table = 'RealTime09';
      limit *= 10;
    }

    let list = [];
    if (!limit || limit <= 0 ) {
      const sql = `
        select * from ${table}
          where
          slice = :slice
          and recordTime >= :start
          and recordTime <=:end
          order by id desc`;
      list = await db.selectAll(sql, {slice, start, end});
    } else {
      let sql = `
        select * from ${table}
          where
          slice = :slice
          order by id desc
          limit: limit`;
      list = await db.selectAll(sql, {slice, limit});
    }



    if (x === "dxds") {
      const dxdsArray = ['大', '小', '单', '双'];
      dxdsArray.forEach(element => {
        let item = { label:'', data:[] };

        let part = _.filter(list, ['x', element]);
        part = part.reverse();
        logger.debug(part);

        item.label = element;
        item.data = part.map(it => {
          it.x = new moment.utc(it.recordTime).local().format('YYYY-MM-DD HH:mm');
          it.y = it.probability;
          delete it.id
          delete it.recordTime
          delete it.slice
          delete it.createdAt
          delete it.probability
          return it;
        })
        result.push(item);
      });
    } else {
      for (let i = 0; i < 10; ++i) {
        let item = { label:'', data:[] };
        let part = _.filter(list, ['x', i.toString()]);
        part = part.reverse();
        logger.debug(part);

        item.label = i;
        item.data = part.map(it =>
            {
              it.x = new moment.utc(it.recordTime).local().format('YYYY-MM-DD HH:mm');
              it.y = it.probability;
              delete it.id
              delete it.recordTime
              delete it.slice
              delete it.createdAt
              delete it.probability
              return it;
            }
          );
        result.push(item);
      }
    }

    return result;
  }
}


const realTime = new RealTime()
module.exports = realTime
