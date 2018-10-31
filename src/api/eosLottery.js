const axios = require('axios')
const moment = require('moment');
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

        const result = this._resultHandel(newestLottery.result)
        const lData = {
          gameid: newestLottery.id,
          result,
          daxiao: this._daxiaoHandle(result),
          danshuang: this._danshuangHandle(result),
          recordTime
        }
        const cResult = await LotteryRecord.create(lData)
        // console.log(`cResult:`, cResult);
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
      // console.log(`_getList:`, response);
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
