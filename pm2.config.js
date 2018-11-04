const envs = ['development', 'test', 'production']
module.exports = {
  apps: [
    ...envs.map(it => ({
      name: 'letou-sync-worker-' + it,
      instances: 1,
      script: 'src/tools/syncLotteryJob.js',
      args: [],
      cwd: './',
      exec_mode: 'cluster_mode',
      env: {
        NODE_APP_INSTANCE: '',
        NODE_ENV: it
      }
    }))
  ]
}