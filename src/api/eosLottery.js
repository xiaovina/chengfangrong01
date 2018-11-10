const axios = require('axios')
const _ = require('lodash')
const moment = require('moment');
const { kmp } = require('kmp-matcher');
const logger = require('../logger')
const db = require('../db')
const { LotteryRecord } = db.models

class EosLottery {
  constructor() {}

  async SyncNewestLottery() {
    const lastestLottery = await this._getLastLottery();
    if (lastestLottery) {
      const recordTime = moment(lastestLottery.recordTime).add(1, 'm').toDate()
      console.log(`newest recordTime:`, recordTime);

      let newestLottery = await this._getList(lastestLottery.gameid)
      if (newestLottery && newestLottery.rows && newestLottery.rows.length > 0) {
        newestLottery = newestLottery.rows[0]
        console.log(`newestLottery:`, newestLottery);

        if (newestLottery.result != -1) {
          const result = this._resultHandel(newestLottery.result)
          const lData = {
            gameid: newestLottery.id,
            result,
            daxiao: this._daxiaoHandle(result),
            danshuang: this._danshuangHandle(result),
            recordTime
          }
          await LotteryRecord.create(lData)
        }
      }
    }
  }

  async InitLottery(newest_bound) {
    const now = new Date();
    let newestLottery = await this._getList(newest_bound)
    if (newestLottery && newestLottery.rows && newestLottery.rows.length > 0) {
      newestLottery = newestLottery.rows[0]
      console.log(`newestLottery:`, newestLottery);

      const result = this._resultHandel(newestLottery.result)
      const lData = {
        gameid: newestLottery.id,
        result,
        daxiao: this._daxiaoHandle(result),
        danshuang: this._danshuangHandle(result),
        recordTime: now,
      }
      const cResult = await LotteryRecord.create(lData)
      console.log(`cResult:`, cResult);
    }
  }

  async GetList(start, end) {
    const dateStart = moment(start).add(-1, 'm').toDate()
    const dateEnd = moment(end).add(1, 'm').toDate()
    logger.debug(dateStart);
    logger.debug(dateEnd);

    const sql = `
    select daxiao, danshuang from LotteryRecord
      where recordTime > :dateStart
      and recordTime <:dateEnd
    `;
    return await db.selectAll(sql, {dateStart, dateEnd});
  }

  async dealAnalizyAll(list) {
    const AnalizyRange = {
      da: '大',
      da1: 1,
      xiao: '小',
      xiao0: 0,
      dan: '单',
      dan1: 1,
      shuang: '双',
      shuang0: 0
    };

    let daxiaoList = [];
    let danshuangList = [];
    list.forEach(item => {
      if(item.daxiao === AnalizyRange.da) {
        daxiaoList.push(1);
      } else {
        daxiaoList.push(0);
      }
      if(item.danshuang === AnalizyRange.dan) {
        danshuangList.push(1);
      } else {
        danshuangList.push(0);
      }
    });

    let daxiaoStr = daxiaoList.map(o => o).join('');
    logger.debug(daxiaoStr)
    let danshuangStr = danshuangList.map(o => o).join('');
    logger.debug(danshuangStr)

    // daxiao handle
    const daResult = await this._analizyItem(daxiaoStr, '1');
    logger.debug(daResult)
    const xiaoResult = await this._analizyItem(daxiaoStr, '0');
    logger.debug(xiaoResult)

    // danshaung handle
    const danResult = await this._analizyItem(danshuangStr, '1');
    logger.debug(danResult)
    const shuangResult = await this._analizyItem(danshuangStr, '0');
    logger.debug(shuangResult)

    const result = {
      daResult: this._dealProbability(daResult),
      xiaoResult: this._dealProbability(xiaoResult),
      danResult: this._dealProbability(danResult),
      shuangResult: this._dealProbability(shuangResult),
    }
    logger.debug(result)

    return result
  }

  async _analizyItem(str, range01) {
    let result = [];
    if(range01 === '1') {
      str = `0${str}0`;
    } else {
      str = `1${str}1`;
    }
    logger.debug(str);

    for(let i = 1; i <= 15; i++) {
      let subStr = range01.repeat(i);
      if(range01 === '1') {
        subStr = `0${subStr}0`;
      } else {
        subStr = `1${subStr}1`;
      }
      result.push(this._matchTimes(str, subStr));
    }
    return result;
  }

  _dealProbability(list) {
    const denominator = parseFloat(_.sum(list))
    let result = []
    logger.debug(denominator)

    list.forEach(item => {
      let r = (item / denominator);
      r = r.toFixed(4)*100 / 100;
      r = (r*100).toFixed(2);
      result.push(r);
    });
    return result;
  }

  async dealAnalizy(list, daxiao = null, danshuang = null) {
    const AnalizyRange = {
      da: '大',
      xiao: '小',
      dan: '单',
      shuang: '双'
    };
    let result = []
    try {
      if (list && list.length > 0) {
        if (daxiao) {
          let daxiaoStr = list.map(o => o.daxiao).join('');
          logger.debug(daxiaoStr);

          if (daxiao === AnalizyRange.da) {
            daxiaoStr = `小${daxiaoStr}小`;
            logger.debug(daxiaoStr);

            for(let i = 1; i <= 15; i++) {
              const daStr = AnalizyRange.da.repeat(i);
              const daSubString = `小${daStr}小`;
              result.push(this._matchTimes(daxiaoStr, daSubString));
            }
          } else if (daxiao === AnalizyRange.xiao) {
            daxiaoStr = `大${daxiaoStr}大`;
            logger.debug(daxiaoStr);

            for(let i = 1; i <= 15; i++) {
              const xiaoStr = AnalizyRange.xiao.repeat(i);
              const xiaoSubString = `大${xiaoStr}大`;
              result.push(this._matchTimes(daxiaoStr, xiaoSubString));
            }
          }
        } else if (danshuang) {
          let danshuangStr = list.map(o => o.danshuang).join('');
          logger.debug(danshuangStr);

          if (danshuang === AnalizyRange.dan) {
            danshuangStr = `双${danshuangStr}双`;
            logger.debug(danshuangStr);

            for(let i = 1; i <= 15; i++) {
              const danStr = AnalizyRange.dan.repeat(i);
              const danSubString = `双${danStr}双`;
              result.push(this._matchTimes(danshuangStr, danSubString));
            }
          } else if (danshuang === AnalizyRange.shuang) {
            danshuangStr = `单${danshuangStr}单`;
            logger.debug(danshuangStr);

            for(let i = 1; i <= 15; i++) {
              const shaungStr = AnalizyRange.shuang.repeat(i);
              const shuangSubString = `单${shaungStr}单`;
              result.push(this._matchTimes(danshuangStr, shuangSubString));
            }
          }
        }
      }

    } catch (err) {
      logger.error(err);
    }

    logger.debug(result);
    return result;
  }

  async dealAnalizy(list, daxiao = null, danshuang = null) {
    const AnalizyRang = {
      da: '大',
      xiao: '小',
      dan: '单',
      shuang: '双'
    };
    let result = []
    try {
      if (list && list.length > 0) {
        if (daxiao) {
          let daxiaoStr = list.map(o => o.daxiao).join('');
          logger.debug(daxiaoStr);

          if (daxiao === AnalizyRang.da) {
            daxiaoStr = `小${daxiaoStr}小`;
              logger.debug(daxiaoStr);

            for(let i = 1; i <= 15; i++) {
              const daStr = AnalizyRang.da.repeat(i);
              const daSubString = `小${daStr}小`;
              result.push(this._matchTimes(daxiaoStr, daSubString));
            }
          } else if (daxiao === AnalizyRang.xiao) {
            daxiaoStr = `大${daxiaoStr}大`;
            logger.debug(daxiaoStr);

            for(let i = 1; i <= 15; i++) {
              const xiaoStr = AnalizyRang.xiao.repeat(i);
              const xiaoSubString = `大${xiaoStr}大`;
              result.push(this._matchTimes(daxiaoStr, xiaoSubString));
            }
          }
        } else if (danshuang) {
          let danshuangStr = list.map(o => o.danshuang).join('');
          logger.debug(danshuangStr);

          if (danshuang === AnalizyRang.dan) {
            danshuangStr = `双${danshuangStr}双`;
            logger.debug(danshuangStr);

            for(let i = 1; i <= 15; i++) {
              const danStr = AnalizyRang.dan.repeat(i);
              const danSubString = `双${danStr}双`;
              result.push(this._matchTimes(danshuangStr, danSubString));
            }
          } else if (danshuang === AnalizyRang.shuang) {
            danshuangStr = `单${danshuangStr}单`;
            logger.debug(danshuangStr);

            for(let i = 1; i <= 15; i++) {
              const shaungStr = AnalizyRang.shuang.repeat(i);
              const shuangSubString = `单${shaungStr}单`;
              result.push(this._matchTimes(danshuangStr, shuangSubString));
            }
          }
        }
      }

    } catch (err) {
      logger.error(err);
    }

    logger.debug(result);
    return result;
  }

  _matchTimes(mainString, subString) {
    const match =  kmp(mainString, subString);
    if(match && match.length) {
      return match.length;
    } else {
      return 0;
    }
  }

  async SyncLottery() {
    // TODO sync by gamme id range
  }

  async _getList(lower_bound, upper_bound, limit) {

    const lower = Number(lower_bound)
    return axios.post(
      'https://eosjs.eosplay.com/v1/chain/get_table_rows',
      {
        json: true,
        code: "eosplaybrand",
        scope: "eosplaybrand",
        table: "game",
        table_key: "id",
        lower_bound: lower + 1,
        upper_bound: upper_bound || lower + 2,
        limit: limit || 1
      }
    ).then( function (response) {
      if (response && response.status && response.status === 200) {
        console.log(`_getList:`, response.data)
        return response.data;
      } else {
        return null
      }
    }).catch( function(error) {
      logger.error(error);
    });
  }

  async _getLastLottery() {
    const sql = `select * from LotteryRecord order by id desc limit 1;`
    return await db.selectOne(sql);
  }

  //填充截取法
  _resultHandel(result) {
    //这里用slice和substr均可
    return (Array(6).join("0") + result).slice(-6);
  }

  _daxiaoHandle(result) {
    if (result % 10 >= 5) {
      return "大";
    } else {
      return "小";
    }
  }

  _danshuangHandle(result) {
    if (result % 2 === 0) {
      return "双";
    } else {
      return "单";
    }
  }
}

const eosLottery = new EosLottery()

module.exports = eosLottery
