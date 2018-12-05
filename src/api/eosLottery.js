const axios = require('axios')
const _ = require('lodash')
const moment = require('moment');
const { kmp } = require('kmp-matcher');
const logger = require('../logger')
const db = require('../db')
const { LotteryRecord } = db.models

class EosLottery {
  constructor() {
    this.AnalizyDayCount = 20;
  }

  async SyncNewestLottery() {
    const lastestLottery = await this._getLastLottery();
    if (lastestLottery) {
      const recordTime = moment(lastestLottery.recordTime).add(1, 'm').toDate()

      let newestLottery = await this._getList(lastestLottery.gameid)
      if (newestLottery && newestLottery.rows && newestLottery.rows.length > 0) {
        newestLottery = newestLottery.rows[0]

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

    const sql = `
    select daxiao, danshuang from LotteryRecord
      where recordTime > :dateStart
      and recordTime <:dateEnd
      order by id desc
    `;
    return await db.selectAll(sql, {dateStart, dateEnd});
  }

  async GetLatest(limit, offset = 0) {
    const sql = `
      select daxiao, danshuang, result from LotteryRecord
      order by id desc limit ${limit} OFFSET ${offset}
    `;
    return await db.selectAll(sql);
  }

  // 最近多连续值
  async dealTopXX(limit) {
    const list = await this.GetLatest(limit);
    console.log(list);

    let result = [];
    const AnalizyRange = {
      da: '大',
      xiao: '小',
      dan: '单',
      shuang: '双'
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

    const daxiaoNonstop = this.getNonstopCode(daxiaoList);
    if (daxiaoNonstop && daxiaoNonstop.length > 0) {
      let daxiaodanshaung = '';
      if (daxiaoNonstop[0][0] === 0) {
        daxiaodanshaung = AnalizyRange.xiao;
      } else {
        daxiaodanshaung = AnalizyRange.da;
      }

      result.push({
        daxiaodanshaung,
        nonstopCount: daxiaoNonstop[0].length
      });
    }

    const danshuangNonstop = this.getNonstopCode(danshuangList);
    if (danshuangNonstop && danshuangNonstop.length > 0) {

      let daxiaodanshaung = '';
      if (danshuangNonstop[0][0] === 0) {
        daxiaodanshaung = AnalizyRange.shuang;
      } else {
        daxiaodanshaung = AnalizyRange.dan;
      }

      result.push({
        daxiaodanshaung,
        nonstopCount: danshuangNonstop[0].length
      });
    }

    return result;
  }

  getNonstopCode(arr){
    var result = [],
        i = 0;
    result[i] = [arr[0]];
    arr.reduce(function(prev, cur){
      cur-prev === 0 ? result[i].push(cur) : result[++i] = [cur];
      return cur;
    });
    return result;
  }

  async getNewestGameId() {
    const sql = `
    select gameid from LotteryRecord
    order by id desc limit 1;
  `;
  return await db.selectAll(sql);
  }

  // 条件概率统计 数量
  async dealCountAll(list) {
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
    let danshuangStr = danshuangList.map(o => o).join('');

    // daxiao handle
    const daResult = await this._analizyItem(daxiaoStr, '1');
    const xiaoResult = await this._analizyItem(daxiaoStr, '0');

    // danshaung handle
    const danResult = await this._analizyItem(danshuangStr, '1');
    const shuangResult = await this._analizyItem(danshuangStr, '0');

    const result = {
      daResult,
      xiaoResult,
      danResult,
      shuangResult,
    }

    return result
  }

  // 条件概率统计
  async dealAnalizyAll(list) {
    const countR = await this.dealCountAll(list);
    const result = {
      daResult: this._dealProbability(countR.daResult),
      xiaoResult: this._dealProbability(countR.xiaoResult),
      danResult: this._dealProbability(countR.danResult),
      shuangResult: this._dealProbability(countR.shuangResult),
    }

    return result
  }

  // 随机概率统计 dxds
  async dealRandomDXDSAnalizy(list) {
    let daxiaoList = [];
    let danshuangList = [];
    list.forEach(item => {
      if(item.daxiao === '大') {
        daxiaoList.push(1);
      } else {
        daxiaoList.push(0);
      }
      if(item.danshuang === '单') {
        danshuangList.push(1);
      } else {
        danshuangList.push(0);
      }
    });

    const daResult = this._dealRandomProbability(daxiaoList, 1);
    const xiaoResult = 100 - daResult;
    const danResult = this._dealRandomProbability(danshuangList, 1);
    const shuangResult = 100 - danResult;

    const result = {
      daResult,
      xiaoResult,
      danResult,
      shuangResult,
    }

    return result
  }

  // 随机概率统计 0-9
  async dealRandom09Analizy(list) {
    let result = [];
    for (let item of list) {
      item.item09 = item.result % 10;
    }
    for (let i = 0; i <= 9; i++) {
      let list09 = list.filter(o => o.item09 === i);
      let p = list09.length / list.length;
      p = parseFloat((p*100).toFixed(2));
      result.push(p);
    }
    return result
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

          if (daxiao === AnalizyRange.da) {
            daxiaoStr = `小${daxiaoStr}小`;

            for(let i = 1; i <= this.AnalizyDayCount; i++) {
              const daStr = AnalizyRange.da.repeat(i);
              const daSubString = `小${daStr}小`;
              result.push(this._matchTimes(daxiaoStr, daSubString));
            }
          } else if (daxiao === AnalizyRange.xiao) {
            daxiaoStr = `大${daxiaoStr}大`;

            for(let i = 1; i <= this.AnalizyDayCount; i++) {
              const xiaoStr = AnalizyRange.xiao.repeat(i);
              const xiaoSubString = `大${xiaoStr}大`;
              result.push(this._matchTimes(daxiaoStr, xiaoSubString));
            }
          }
        } else if (danshuang) {
          let danshuangStr = list.map(o => o.danshuang).join('');

          if (danshuang === AnalizyRange.dan) {
            danshuangStr = `双${danshuangStr}双`;

            for(let i = 1; i <= this.AnalizyDayCount; i++) {
              const danStr = AnalizyRange.dan.repeat(i);
              const danSubString = `双${danStr}双`;
              result.push(this._matchTimes(danshuangStr, danSubString));
            }
          } else if (danshuang === AnalizyRange.shuang) {
            danshuangStr = `单${danshuangStr}单`;

            for(let i = 1; i <= this.AnalizyDayCount; i++) {
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

    return result;
  }

  async dealAllProbability() {
    let total = await this._getTotalRecord();
    total = total.total
    const allRecords = await this.GetLatest(total);
    return await this.dealAnalizyAll(allRecords);
  }

  async dealSliceProbability() {
    let result = []
    const slice = [1, 3, 5, 13, 21, 34, 55, 89, 144, 233];
    for (const v of slice) {
      const allRecords = await this.GetLatest(v * 60);
      const p = await this.dealAnalizyAll(allRecords);
      result.push({ v, p });
    }
    return result;
  }

  async GetAllProbability() {
    let probabilityList = []
    const nonstop = await this.dealTopXX(20);
    const all = await this.dealAllProbability();

    for (const nonstopItem of nonstop) {
      if (nonstopItem.daxiaodanshaung === '大') {
        let before = all.daResult.filter(( v, k ) => {
          if ( k < nonstopItem.nonstopCount ) return v;
        }).reduce(( a, b ) =>
          a + b
        );

        if (before > 80) {
          before *= 0.8;
        }
        probabilityList.push({
          dxds: '大',
          p: 100 - before
        });
        probabilityList.push({
          dxds: '小',
          p: before
        });
      } else if (nonstopItem.daxiaodanshaung === '小') {
        let before = all.xiaoResult.filter(( v, k ) => {
          if ( k < nonstopItem.nonstopCount ) return v;
        }).reduce(( a, b ) =>
          a + b
        );

        if (before > 80) {
          before *= 0.8;
        }
        probabilityList.push({
          dxds: '大',
          p: before
        });
        probabilityList.push({
          dxds: '小',
          p: 100 - before
        });
      } else if (nonstopItem.daxiaodanshaung === '单') {
        let before = all.danResult.filter(( v, k ) => {
          if ( k < nonstopItem.nonstopCount ) return v;
        }).reduce(( a, b ) =>
          a + b
        );

        if (before > 80) {
          before *= 0.8;
        }
        probabilityList.push({
          dxds: '单',
          p: 100 - before
        });
        probabilityList.push({
          dxds: '双',
          p: before
        });
      } else if (nonstopItem.daxiaodanshaung === '双') {
        let before = all.shuangResult.filter(( v, k ) => {
          if ( k < nonstopItem.nonstopCount ) return v;
        }).reduce(( a, b ) =>
          a + b
        );

        if (before > 80) {
          before *= 0.8;
        }
        probabilityList.push({
          dxds: '单',
          p: before
        });
        probabilityList.push({
          dxds: '双',
          p: 100 - before
        });
      }
    }

    for (let item of probabilityList) {
      item.p = parseFloat(item.p.toFixed(2));
    }

    return probabilityList;
  }

  // 条件概率
  async GetSliceProbability(slice) {
    let probabilityList = []
    const nonstop = await this.dealTopXX(20);
    const allRecords = await this.GetLatest(slice * 60);
    const allSlice = await this.dealAnalizyAll(allRecords);
    const all = await this.dealAllProbability();
    const totalStatisticsNumbers = this._sliceMapping(slice);

    for (const nonstopItem of nonstop) {
      if (totalStatisticsNumbers > nonstopItem.nonstopCount) {
        if (nonstopItem.daxiaodanshaung === '大') {
          let after1 = all.daResult.filter(( v, k ) => {
            if ( k >= nonstopItem.nonstopCount ) return v;
          }).reduce(( a, b ) =>
            a + b
          );

          let after2 = allSlice.daResult.filter(( v, k ) => {
            if ( k >= nonstopItem.nonstopCount ) return v;
          }).reduce(( a, b ) =>
            a + b
          );
          let tp = this._comparedP(after1, after2);

          if (tp > 80) {
            tp *= 0.8;
          }
          probabilityList.push({
            dxds: '大',
            p: tp
          });
          probabilityList.push({
            dxds: '小',
            p: 100 - tp
          });
        } else if (nonstopItem.daxiaodanshaung === '小') {
          let after1 = all.xiaoResult.filter(( v, k ) => {
            if ( k >= nonstopItem.nonstopCount ) return v;
          }).reduce(( a, b ) =>
            a + b
          );

          let after2 = allSlice.xiaoResult.filter(( v, k ) => {
            if ( k >= nonstopItem.nonstopCount ) return v;
          }).reduce(( a, b ) =>
            a + b
          );
          let tp = this._comparedP(after1, after2);

          if (tp > 80) {
            tp *= 0.8;
          }
          probabilityList.push({
            dxds: '大',
            p: 100 - tp
          });
          probabilityList.push({
            dxds: '小',
            p: tp
          });
        } else if (nonstopItem.daxiaodanshaung === '单') {
          let after1 = all.danResult.filter(( v, k ) => {
            if ( k >= nonstopItem.nonstopCount ) return v;
          }).reduce(( a, b ) =>
            a + b
          );

          let after2 = allSlice.danResult.filter(( v, k ) => {
            if ( k >= nonstopItem.nonstopCount ) return v;
          }).reduce(( a, b ) =>
            a + b
          );
          let tp = this._comparedP(after1, after2);

          if (tp > 80) {
            tp *= 0.8;
          }
          probabilityList.push({
            dxds: '单',
            p: tp
          });
          probabilityList.push({
            dxds: '双',
            p: 100 - tp
          });
        } else if (nonstopItem.daxiaodanshaung === '双') {
          let after1 = all.shuangResult.filter(( v, k ) => {
            if ( k >= nonstopItem.nonstopCount ) return v;
          }).reduce(( a, b ) =>
            a + b
          );

          let after2 = allSlice.shuangResult.filter(( v, k ) => {
            if ( k >= nonstopItem.nonstopCount ) return v;
          }).reduce(( a, b ) =>
            a + b
          );
          let tp = this._comparedP(after1, after2);

          if (tp > 80) {
            tp *= 0.8;
          }
          probabilityList.push({
            dxds: '单',
            p: 100 - tp
          });
          probabilityList.push({
            dxds: '双',
            p: tp
          });
        }
      }
    }

    for (let item of probabilityList) {
      item.p = parseFloat(item.p.toFixed(2));
    }

    return probabilityList;
  }

  // 随机概率 dxds
  async GetSliceRandomProbability(slice, isBefore = false) {
    let probabilityList = []

    let allRecords = [];
    if (isBefore) {
      allRecords = await this.GetLatest(slice * 60, slice * 60);
    } else {
      allRecords = await this.GetLatest(slice * 60);
    }
    const allSlice = await this.dealRandomDXDSAnalizy(allRecords);
    const all = 100;

    probabilityList.push(
      {
        dxds: '大',
        p: all - allSlice.daResult
      }
    )
    probabilityList.push(
      {
        dxds: '小',
        p: all - allSlice.xiaoResult
      }
    )
    probabilityList.push(
      {
        dxds: '单',
        p: all - allSlice.danResult
      }
    )
    probabilityList.push(
      {
        dxds: '双',
        p: all - allSlice.shuangResult
      }
    )

    for (let item of probabilityList) {
      item.p = parseFloat(item.p.toFixed(2));
    }

    return probabilityList;
  }

  // 随机概率 0-9
  async GetSlice09RandomProbability(slice, isBefore = false) {
    let probabilityList = []
    let allRecords = [];
    if (isBefore) {
      allRecords = await this.GetLatest(slice * 60, slice * 60);
    } else {
      allRecords = await this.GetLatest(slice * 60);
    }
    const allSlice = await this.dealRandom09Analizy(allRecords);

    const all = 20;
    for (let item of allSlice) {
      let p = all - item;
      p = p.toFixed(4)*100 / 100;
      probabilityList.push(p);
    }
    for (let item of probabilityList) {
      item = parseFloat(item.toFixed(2));
    }

    return probabilityList;
  }

  async _getTotalRecord() {
    const sql = `select count(1) as total from LotteryRecord;`
    return await db.selectOne(sql);
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

  async _analizyItem(str, range01) {
    let result = [];
    if(range01 === '1') {
      str = `0${str}0`;
    } else {
      str = `1${str}1`;
    }

    for(let i = 1; i <= this.AnalizyDayCount; i++) {
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

  _matchTimes(mainString, subString) {
    const match =  kmp(mainString, subString);
    if(match && match.length) {
      return match.length;
    } else {
      return 0;
    }
  }

  _dealProbability(list) {
    const denominator = parseFloat(_.sum(list))
    let result = []

    list.forEach(item => {
      let r = (item / denominator);
      r = r.toFixed(4)*100 / 100;
      r = parseFloat((r*100).toFixed(2));
      result.push(r);
    });
    return result;
  }

  _dealRandomProbability(list, numerator) {
    let result = (list.filter((item) => item === numerator).length / list.length);
    result = result.toFixed(4) * 100 / 100;
    result = parseFloat((result*100).toFixed(2));
    return result;
  }

  _dealRandomCount(list, numerator) {
    return list.filter((item) => item === numerator).length;
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

  _average(data) {
    let count = data.length;
    data = data.reduce((previous, current) => current += previous);
    let average = data /= count;
    const av = parseFloat(average.toFixed(2));
    return av;
  }


  _comparedP(previous, current) {
    let cp =  Math.abs(previous - current) / previous + current;
    cp = parseFloat(cp.toFixed(2));
    return cp;
  }

  _sliceMapping(slice) {
    slice = Number(slice);
    if (slice ===2) {
      return 2;
    }
    if (slice ===5) {
      return 3;
    }
    if (slice ===8) {
      return 3;
    }
    if (slice ===13) {
      return 4;
    }
    if (slice ===21) {
      return 4;
    }
    if (slice ===34) {
      return 5;
    }
    if (slice ===55) {
      return 5;
    }
    if (slice ===89) {
      return 6;
    }
    if (slice ===144) {
      return 8;
    }
    if (slice ===233) {
      return 9;
    }
  }
}

const eosLottery = new EosLottery()

module.exports = eosLottery
