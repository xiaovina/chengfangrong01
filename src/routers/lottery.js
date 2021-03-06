const Router = require('koa-router')
const eosLotteryServices = require('../api/eosLottery')
const eosClient = require('../api/eosClient')
const realTimeService = require('../api/realTime')
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
      const amount = Number(quantity).toFixed(4);
      result = await eosClient.transfer(privateKey, actor, amount, daxiaodanshuang).catch(err=>{
          console.log("transfer error: ",err)
          ctx.body = err
        });
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
  result.analizyList = await eosLotteryServices.dealCountAll(list);
  if (list && list.length) {
    result.total = list.length;
  }
  ctx.body = result
})

router.get('/analizy/nonstop', async ctx => {
  ctx.body = await eosLotteryServices.dealTopXX(20);
})

router.get('/probability/all', async ctx => {
  ctx.body = await eosLotteryServices.GetAllProbability();
})

router.get('/probability/slice', async ctx => {
  const { slice } = ctx.request.query;
  try {
    let x = await eosLotteryServices.GetSliceProbability(slice);
    ctx.body = x;
  } catch (err) {
    console.log(err);
  }
})

router.get('/probability/slice/dxds', async ctx => {
  const { slice } = ctx.request.query;
  try {
    let x = await eosLotteryServices.GetSliceRandomProbability(slice);
    ctx.body = x;
  } catch (err) {
    console.log(err);
  }
})

router.get('/probability/slice/zerotonine', async ctx => {
  const { slice } = ctx.request.query;
  try {
    let x = await eosLotteryServices.GetSlice09RandomProbability(slice);
    ctx.body = x;
  } catch (err) {
    console.log(err);
  }
})

router.get('/analizy/charts/', async ctx => {
  let { x, slice, start, end, limit } = ctx.request.query;
  if (!limit || limit <= 0) {
    start = new moment(start).add(-8, 'h').format('YYYY-MM-DD HH:mm');
    end = new moment(end).add(-8, 'h').format('YYYY-MM-DD HH:mm');
  }

  ctx.body = await realTimeService.getData(x, slice, start, end, limit);
})



router.get('/eos/newest', async ctx => {
  ctx.body = await eosLotteryServices.getNewestGameId();
})



module.exports = router
