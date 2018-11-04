const Router = require('koa-router')
const eosLotteryServices = require('../api/eosLottery')

const router = new Router({
  prefix: '/eoslottery'
})


router.get('/all', async ctx => {
  const { start, end, daxiao, danshuang } = ctx.request.query;
  const list = await eosLotteryServices.GetList(start, end);
  ctx.body = await eosLotteryServices.dealAnalizy(list, daxiao, danshuang);
  console.log(ctx);
})


module.exports = router
