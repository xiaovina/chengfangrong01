const _ = require('lodash')
const logger = require('../logger')
const moment = require('moment');
const db = require('../db');
const eosLotter = require('./eosLottery');
const { BettingConfig, BettingLog } = db.models


class BettingService {
  constructor() {}

  /// ********************** config start **********************

  async getConfigById(id) {
    return await BettingConfig.getById(id);
  }

  async getConfigList() {
    return await BettingConfig.findAll();
  }

  async getAvalibalConfig() {
    const sql = `
    select * from BettingConfig
    where status in (0, 1);
    `;
    return await db.selectAll(sql);
  }

  async getPendingConfig() {
    const sql = `
    select * from BettingConfig
    where status = 1;
    `;
    return await db.selectAll(sql);
  }

  async getConfigListByStatus(status) {
    return await BettingConfig.findAll({
      where: { status }
    });
  }

  async updateConfigStatus(id, status) {
    let result;
    let sql;

    if (status === 0) {
      sql = `
      update bettingConfig set status=0, frequencyId=:frequencyId
      where id=:id;
      `;
      const frequencyId = this._configFrequencyIdGen();
      result = await db.execute(sql, {frequencyId, id });
    } else {
      sql = `
      update bettingConfig set status=:status
      where id=:id;
      `;
      result = await db.execute(sql, { id, status });
    }
    return result;
  }

  async createConfig(config) {
    // result 0-lose 1-win
    config.config = JSON.stringify(config.configEx);
    config.status = 0; // new
    config.frequencyId = this._configFrequencyIdGen();
    return await BettingConfig.create(config);
  }

  _configFrequencyIdGen() {
    return Math.abs((new Date()).getTime());
  }

  /// ********************** config end **********************


  /// ********************** log start **********************

  async createLog(log) {
    return await BettingLog.create(log);
  }

  async getWinCountByFrequencyId(frequencyId) {
    const sql = `
    select count(*) total from bettinglog
    where frequencyId=:frequencyId and isWin = 1;
    `;
    return await db.selectOne(sql, { frequencyId });
  }

  async getLogCountByFrequencyId(frequencyId) {
    const sql = `
    select count(*) as total from bettinglog
    where frequencyId=:frequencyId;
    `;
    return await db.selectOne(sql, { frequencyId });
  }

  /// ********************** log end **********************


  /// ********************** strategy start **********************

  async checkStop(config) {
    let stop = false;
    if (config && config.config) {
      const configEx = JSON.parse(config.config);
      const winCount = await this.getWinCountByFrequencyId(config.frequencyId);
      stop = winCount.total >= configEx.maxWinTimes

      if (!stop) {
        const bettingTimes = await this.getLogCountByFrequencyId(config.frequencyId);
        stop = bettingTimes >= configEx.bettingTimes;
      }
    }
    return stop;
  }

  async checkStart(config) {
    let start = false;
    if (config && config.config) {
      const configEx = JSON.parse(config.config);

      const one = await eosLotter.GetSliceRandomProbability(1);
      const oneHourP = one.filter(it => it.dxds === configEx.item)[0].p;
      if (oneHourP >= configEx.oneHour) {
        const beforeOne = await eosLotter.GetSliceRandomProbability(1, true);
        const beforeOneHourP = beforeOne.filter(it => it.dxds === configEx.item)[0].p;
        start = beforeOneHourP >= configEx.beforeOneHour;
      }
    }
    return start;
  }

  /// ********************** strategy end **********************

  /// ********************** job start **********************

  // async

  /// ********************** job end **********************


}

const bettingService = new BettingService()

module.exports = bettingService
