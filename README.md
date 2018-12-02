## usage

### pre-setup

``` shell
curl --silent --location https://rpm.nodesource.com/setup_9.x | sudo bash - && sudo yum -y install git gcc-c++ make && sudo yum -y install nodejs && sudo npm install -g pm2 apidoc
```

``` shell
ls -la
```

### l data

> ENV can be test, development, production

#### init ldata

``` sh
NODE_ENV=<env> node tools/initLottery.js <gameid>
```

#### start sync work

```sh
pm2 start pm2.config.js --only letou-sync-worke <env> --watch
```

#### start realTime probability work

```sh
pm2 start pm2.config.js --only real-time-probability-worker-<env> --watch
```

#### start analizy web

``` sh
pm2 start pm2.config.js --only letou-analizy-web-<env> --watch
```

#### start betting job

``` sh
pm2 start pm2.config.js --only letou-auto-betting-job-<env> --watch
```

#### start betting log

``` sh
pm2 start pm2.config.js --only letou-auto-betting-log-<env> --watch
```

### debug

just vscode DEBUG

### mysql in winserver

-- https://blog.csdn.net/qq_383698639/article/details/81298367
