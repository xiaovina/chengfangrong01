const logger = require('../logger');
const { Api, JsonRpc, JsSignatureProvider } = require('eosjs');
const fetch = require('node-fetch');
const { TextDecoder, TextEncoder } = require('text-encoding');
const config = require('config')

class EosClient {
  constructor() {}
  // test
  // 5Jg3KWnT2cUsKvmiJYRo7iULfwyhunVU3uDrZEAvjtq2GpABiJQ tmd111111111
  _constructorApi(privateKey) {
    const signatureProvider = new JsSignatureProvider([privateKey]);
    const rpc = new JsonRpc(config.eos.api, { fetch });
    return new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });
  }
  // 转账操作
  async transfer(privateKey, actor, quantity, daxiaodanshuang) {
    const api = this._constructorApi(privateKey);
    const result = await api.transact({
      actions: [{
        account: 'eosio.token',
        name: 'transfer',
        authorization: [{
          actor: actor,
          permission: 'active',
        }],
        data: {
          from: actor,
          to: config.eos.toUser,
          quantity: `${quantity} EOS`,
          memo: `lottery:${daxiaodanshuang}`,
        },
      }]
    }, {
      blocksBehind: 3,
      expireSeconds: 30,
    });
    // logger.info(result);
    return result;
  }
}

const eosClient = new EosClient()
module.exports = eosClient
