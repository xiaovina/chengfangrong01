const Router = require('koa-router')
const eosLotteryServices = require('../api/eosLottery')
const eosClient = require('../api/eosClient')
const moment = require('moment');

const router = new Router({
  prefix: '/lottery'
})


router.post('/eos/transfer', async ctx => {
  let result = {};
  const { privateKey, actor, quantity, daxiaodanshuang } = ctx.request.body;
  let flag = true;
  if (!privateKey || privateKey.length < 51) {
    flag = false
    ctx.body = "私钥 is required";
  }
  if (!actor || actor.length < 12) {
    flag = false
    ctx.body = "账号 is required";
  }
  if (quantity < 0.0001) {
    flag = false
    ctx.body = "金额 须大于0.0001";
  }
  if (!daxiaodanshuang) {
    flag = false
    ctx.body = "大小 is required";
  }

  if (flag) {
    try {
      let amount = Number(quantity).toFixed(4);
      result = await eosClient.transfer(privateKey, actor, amount, daxiaodanshuang).catch(err=>{
          console.log("transfer error: ",err)
          ctx.body = err
        });;
    } catch (ex) {
      ctx.body = ex
    }
    // todo handel result
    ctx.body = result
  }
})

router.get('/analizy', async ctx => {
  let result = { total:0, analizyList: [] };
  let { start, end, daxiao, danshuang } = ctx.request.query;

  start = new moment(start).add(-8, 'h').toDate();
  end = new moment(end).add(-8, 'h').toDate();

  const list = await eosLotteryServices.GetList(start, end);
  result.analizyList = await eosLotteryServices.dealAnalizy(list, daxiao, danshuang);
  if (list && list.length) {
    result.total = list.length;
  }
  ctx.body = result
})

router.get('/analizy/all', async ctx => {
  let result = { total:0, analizyList: [] };
  let { start, end } = ctx.request.query;

  start = new moment(start).add(-8, 'h').toDate();
  end = new moment(end).add(-8, 'h').toDate();

  const list = await eosLotteryServices.GetList(start, end);
  result.analizyList = await eosLotteryServices.dealAnalizyAll(list);
  if (list && list.length) {
    result.total = list.length;
  }
  ctx.body = result
})

router.get('/analizy/nonstop', async ctx => {
  ctx.body = await eosLotteryServices.dealTopXX(20);
})



module.exports = router
