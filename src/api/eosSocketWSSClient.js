const yawl = require('yawl');
const url = require('url');
const logger = require('../logger')
const db = require('../db')
const { SocketData } = db.models


class EosSocketWSSClient {
  constructor() { }

  deal(){
    const options = url.parse("wss://eosplay.com/v3/p2p");
    options.extraHeaders = {
      'User-Agent': "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:33.0) Gecko/20100101 Firefox/33.0"
    };
    options.allowTextMessages = true;
    const ws = yawl.createClient(options);
    ws.on('open', function() {
      ws.sendText("hi");
    });
    ws.on('error', function() {
      ws.sendText("hi");
    });
    try {
      ws.on('textMessage', function(message) {
        // logger.debug(message);
        const messageList =  JSON.parse(message)
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
              SocketData.create(data);
            }
          }
        }
      });
    } catch (err) {
      logger.error(err)
    }
  }
}
const eosSocketWSSClient = new EosSocketWSSClient();
module.exports = eosSocketWSSClient;
