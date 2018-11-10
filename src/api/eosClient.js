const logger = require('../logger');
const { Api, JsonRpc, JsSignatureProvider } = require('eosjs');
const fetch = require('node-fetch');
const { TextDecoder, TextEncoder } = require('text-encoding');

class EosClient {
  constructor() {}
  _constructorApi(privateKey) {
    const signatureProvider = new JsSignatureProvider([privateKey]);
    const rpc = new JsonRpc('https://api.eosnewyork.io', { fetch });
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
          to: 'eosplaybrand',
          quantity: `${quantity} EOS`,
          memo: `lottery:${daxiaodanshuang}`,
        },
      }]
    }, {
      blocksBehind: 3,
      expireSeconds: 30,
    });
    console.log(result);
    return result;
  };
}

const eosClient = new EosClient()
module.exports = eosClient
