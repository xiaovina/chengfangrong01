const Router = require('koa-router');
const bettingService = require('../api/bettingService');
const moment = require('moment');

const router = new Router({
  prefix: '/betting'
})


router.post('/config/new/', async ctx => {
  const config = ctx.request.body;

  let flag = true;
  if (config.isReal && config.isReal === 'true') {
    config.isReal = true;
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
    config.username = 'test-username';
    config.privateKey = 'test-privateKey';
  }
  if (!config.configEx) {
    flag = false
    ctx.body = "投注规则 is required";
  }

  if (!config.configEx.toUserName) {
    flag = false
    ctx.body = "目标账号 is required";
  }

  if (!config.configEx.oneHour || config.configEx.oneHour <= 0) {
    flag = false
    ctx.body = "一小时概率 is required";
  }
  if (!config.configEx.beforeOneHour || config.configEx.beforeOneHour <= 0) {
    flag = false
    ctx.body = "前一小时概率 is required";
  }
  if (!config.configEx.bettingTimes || config.configEx.bettingTimes <= 0) {
    flag = false
    ctx.body = "投注次数 is required";
  }
  if (!config.configEx.maxWinTimes || config.configEx.maxWinTimes <= 0) {
    flag = false
    ctx.body = "总盈利次数 is required";
  }
  if (!config.configEx.amount || config.configEx.amount <= 0) {
    flag = false
    ctx.body = "投注金额 is required";
  } else if (config.configEx.amount < 0.0001) {
    flag = false
    ctx.body = "金额 须大于0.0001";
  }
  if (!config.configEx.item) {
    flag = false
    ctx.body = "+投注备注1 is required";
  }

  if (!config.configEx.memo) {
    flag = false
    ctx.body = "+投注备注2 is required";
  }

  if (flag) {
    let result = "";
    try {
      config.configEx.amount = Number(config.configEx.amount).toFixed(4);
      result = await bettingService.createConfig(config);
      result = "添加成功"
    } catch (ex) {
      result = `添加失败, ${ex}`;
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

router.post('/config/delete/', async ctx => {
  const {id} = ctx.request.body;
  try {
    ctx.body = await bettingService.deleteConfig(id);
  } catch (err) {
    ctx.body = err;
  }
});

router.get('/config', async ctx => {
  let resultList = [];
  const list = await bettingService.getConfigList();
  if (list && list.length > 0) {
    for (const item of list) {
      const configEx = JSON.parse(item.config);
      resultItem = {
        id: item.id,
        oneHour: configEx.oneHour,
        beforeOneHour: configEx.beforeOneHour,
        bettingTimes: configEx.bettingTimes,
        maxWinTimes: configEx.maxWinTimes,
        toUserName: configEx.toUserName,
        item: configEx.item,
        memo: configEx.memo,
        amount: configEx.amount,
        status: statusDesc(item.status),
        frequencyId: item.frequencyId,
        username: item.username,
        // privateKey: item.privateKey,
        isReal: item.isReal ? '真实' : '虚拟'
      }
      resultList.push(resultItem);
    }
  }
  ctx.body = resultList;
});

router.get('/config/frequency/', async ctx => {
  let { frequencyId } = ctx.request.query;
  let result = {};
  const list = await bettingService.getLogRecordByFrequencyId(frequencyId);
  if (list && list.length) {
    result.list = list;
    result.total = list.length;
    result.winCount = list.filter(it => it.isWin === 1 && it.isDeal === 1).length;
    result.dealingCount = list.filter(it => it.isDeal === 0).length;
    result.lostCount = list.length - result.winCount - result.dealingCount;

    for(let item of list) {
      if (item.isDeal) {
        item.isWin = item.isWin === 1 ? "Win": "Lost";
        item.result = `000000${item.result}`.substr(-6, 6);
      } else {
        item.isWin = "处理中";
        item.result = '-';
      }

      item.recordTimeEx = item.recordTime;
      item.recordTime = moment(item.recordTime).format('YYYY/MM/DD HH:mm');
    }
  }
  ctx.body = result;
});

const statusDesc = (status) => {
  switch (status) {
    case 0:
      return '开始中...';
    case 1:
      return '执行中...';
    case 2:
      return '暂停';
  }
}

module.exports = router
