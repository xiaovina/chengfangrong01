class ConfigModelEx {
  oneHour;
  beforeOneHour;
  bettingTimes;
  maxWinTimes;
  amount;
  item;
  constructor(oneHour, beforeOneHour, bettingTimes, maxWinTimes, amount, item) {
    this.oneHour = oneHour;
    this.beforeOneHour = beforeOneHour;
    this.bettingTimes = bettingTimes;
    this.maxWinTimes = maxWinTimes;
    this.amount = amount;
    this.item = item;
  }
}
const configModelEx = new ConfigModelEx()

module.exports = configModelEx
