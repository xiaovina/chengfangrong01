const Router = require('koa-router')
const eosLotteryServices = require('../api/eosLottery')
const moment = require('moment');

const router = new Router({
  prefix: '/lottery'
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


module.exports = router
