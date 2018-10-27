module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [
    {
      name: 'letou.wss.client',
      script: 'src/main.js',
      instances: 1,
      watch: true,
      exec_mode: "cluster"
    },
  ]
};

