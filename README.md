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
pm2 start pm2.config.js --only letou-sync-worker-<env> --watch
```

### debug

just vscode DEBUG
