class ConfigModelEx {
  oneHour;
  beforeOneHour;
  bettingTimes;
  maxWinTimes;
  amount;
  item;
  memo;
  toUserName;
  constructor(oneHour, beforeOneHour, bettingTimes, maxWinTimes, amount, item) {
    this.oneHour = oneHour;
    this.beforeOneHour = beforeOneHour;
    this.bettingTimes = bettingTimes;
    this.maxWinTimes = maxWinTimes;
    this.amount = amount;
    this.item = item;
    this.memo = memo;
    this.toUserName;
  }
}
const configModelEx = new ConfigModelEx()

module.exports = configModelEx
