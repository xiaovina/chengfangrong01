const logger = require('../logger');
const { Api, JsonRpc, JsSignatureProvider } = require('eosjs');
const fetch = require('node-fetch');
const { TextDecoder, TextEncoder } = require('text-encoding');

const privateKey = "";
const signatureProvider = new JsSignatureProvider([privateKey]);
const rpc = new JsonRpc('https://api.eosnewyork.io', { fetch });
const api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });

// 转账操作
const transfer = async () => {
  const result = await api.transact({
    actions: [{
      account: 'eosio.token',
      name: 'transfer',
      authorization: [{
        actor: 'loveboyggggg', // TODO: para
        permission: 'active',
      }],
      data: {
        from: 'loveboyggggg', // TODO: para
        to: 'eosplaybrand', // TODO: para
        quantity: '0.1000 EOS', // TODO: para
        memo: 'lottery:s', // TODO: para
      },
    }]
  }, {
    blocksBehind: 3,
    expireSeconds: 30,
  });
  console.log(result);
};


const run = () => {
  logger.info("process start...");

  transfer().catch(err=>{
    console.log("transfer error: ",err)
  });

  try {
  } catch (err) {
    logger.error(err);
  }
  logger.info("process done")
  process.exit();
}


run()



