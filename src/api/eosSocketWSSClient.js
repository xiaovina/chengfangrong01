const url = require('url');
const logger = require('../logger')
const db = require('../db')
const { SocketData, LotteryRecord } = db.models

const WebSocket = require('ws');



class EosSocketWSSClient {
  constructor() { }

  dealWs() {
    const that = this;
    const ws = new WebSocket('wss://eosplay.com/v3/p2p');

    ws.on('open', function open() {
      ws.send('something');
    });

    ws.on('message', function incoming(data) {
      let messageList
      try {
        messageList =  JSON.parse(data)
      } catch (err) {
        logger.error(data, err);
      }

      if (messageList && messageList.length) {
        for (const item of messageList) {
          if (item.type && item.type === 3) {
            const data = {
              type: item.type,
              blocknum: item.blocknum,
              time: item.time,
              dataId: item.id,
              data: item.data
            }

            if (item.data && item.data.gameid && item.data.result) {
              const lData = {
                gameid: item.data.gameid,
                result: that._resultHandel(item.data.result)
              }
              lData.daxiao = that._daxiaoHandle(lData.result);
              lData.danshuang = that._danshuangHandle(lData.result);
              LotteryRecord.create(lData);
            }

            SocketData.create(data);
          }
        }
      }
    });
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
const eosSocketWSSClient = new EosSocketWSSClient();
module.exports = eosSocketWSSClient;
