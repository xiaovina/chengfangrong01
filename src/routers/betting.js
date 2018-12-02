const Router = require('koa-router');
const bettingService = require('../api/bettingService');
const moment = require('moment');

const router = new Router({
  prefix: '/betting'
})


router.post('/config/new/', async ctx => {
  let result = {};
  const config = ctx.request.body;

  let flag = true;
  if (config.isReal && config.isReal === true) {
    if (!config.privateKey || config.privateKey.length < 51) {
      flag = false
      ctx.body = "私钥 is required";
    }
    if (!config.username || config.username.length < 12) {
      flag = false
      ctx.body = "账号 is required";
    }
  } else {
    config.isReal = false;
  }
  if (!config.configEx) {
    flag = false
    ctx.body = "投注规则 is required";
  }

  if (!config.configEx.oneHour) {
    flag = false
    ctx.body = "oneHour is required";
  }
  if (!config.configEx.beforeOneHour) {
    flag = false
    ctx.body = "beforeOneHour is required";
  }
  if (!config.configEx.bettingTimes) {
    flag = false
    ctx.body = "bettingTimes is required";
  }
  if (!config.configEx.maxWinTimes) {
    flag = false
    ctx.body = "maxWinTimes is required";
  }
  if (!config.configEx.amount) {
    flag = false
    ctx.body = "amount is required";
  } else if (config.configEx.amount < 0.0001) {
    flag = false
    ctx.body = "金额 须大于0.0001";
  }
  if (!config.configEx.item) {
    flag = false
    ctx.body = "投注类型 is required";
  }

  if (flag) {
    try {
      config.configEx.amount = Number(config.configEx.amount).toFixed(4);
      result = await bettingService.createConfig(config)
      .catch( err=> {
          console.log("createConfig error: ",err)
          ctx.body = err
        });
    } catch (ex) {
      ctx.body = ex
    }
    // todo handel result
    ctx.body = result
  }
});

router.post('/config/status/', async ctx => {
  const {id, status} = ctx.request.body;
  try {
    ctx.body = await bettingService.updateConfigStatus(id, status);
  } catch (err) {
    ctx.body = err;
  }
});

router.get('/config', async ctx => {
  ctx.body = await bettingService.getConfigList();
});

module.exports = router
