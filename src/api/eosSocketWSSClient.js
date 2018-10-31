const url = require('url');
const logger = require('../logger')
const db = require('../db')
const { SocketData, LotteryRecord } = db.models

const WebSocket = require('ws');


function WebSocketClient(){
	this.number = 0;	// Message number
	this.autoReconnectInterval = 5*1000;	// ms
}
WebSocketClient.prototype.open = function(url){
	this.url = url;
	this.instance = new WebSocket(this.url);
	this.instance.on('open',()=>{
		this.onopen();
	});
	this.instance.on('message',(data,flags)=>{
		this.number ++;
		this.onmessage(data,flags,this.number);
	});
	this.instance.on('close',(e)=>{
		switch (e.code){
		case 1000:	// CLOSE_NORMAL
			console.log("WebSocket: closed");
			break;
		default:	// Abnormal closure
			this.reconnect(e);
			break;
		}
		this.onclose(e);
	});
	this.instance.on('error',(e)=>{
		switch (e.code){
		case 'ECONNREFUSED':
			this.reconnect(e);
			break;
		default:
			this.onerror(e);
			break;
		}
	});
}
WebSocketClient.prototype.send = function(data,option){
	try{
		this.instance.send(data,option);
	}catch (e){
		this.instance.emit('error',e);
	}
}
WebSocketClient.prototype.reconnect = function(e){
	console.log(`WebSocketClient: retry in ${this.autoReconnectInterval}ms`,e);
        this.instance.removeAllListeners();
	const that = this;
	setTimeout(function(){
		console.log("WebSocketClient: reconnecting...");
		that.open(that.url);
	},this.autoReconnectInterval);
}
WebSocketClient.prototype.onopen = function(e){	console.log("WebSocketClient: open",arguments);	}
WebSocketClient.prototype.onmessage = function(data,flags,number){	console.log("WebSocketClient: message",arguments);	}
WebSocketClient.prototype.onerror = function(e){	console.log("WebSocketClient: error",arguments);	}
WebSocketClient.prototype.onclose = function(e){	console.log("WebSocketClient: closed",arguments);	}

class EosSocketWSSClient {
  constructor() { }

  dealWsEx() {
    const wsc = new WebSocketClient();
    const that = this;

    wsc.open('wss://eosplay.com/v3/p2p');
    wsc.onopen = function(e){
      logger.trace("WebSocketClient connected:",e);
      this.send("ping");
    }
    wsc.onmessage = function(data, flags, number){
      console.log(`WebSocketClient message #${number}: `, data);

      // hack [{...}][{...}]
      data = data.replace(/\s+/g,"");
      if (data.indexOf('}][{') > -1) {
        data = data.replace('}][{', '},{')
      }

      let messageList
      try {
        messageList =  JSON.parse(data)
      } catch (err) {
        logger.error(data, err);
        console.log(data)
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
    }
  }



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
