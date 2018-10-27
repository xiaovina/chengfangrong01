# NaMg

## usage

### pre-setup

``` shell
curl --silent --location https://rpm.nodesource.com/setup_9.x | sudo bash - && sudo yum -y install git gcc-c++ make && sudo yum -y install nodejs && sudo npm install -g pm2 apidoc
```

``` shell
ls -la
```

``` shell
sudo pm2 start ecosystem.config.js
```


### debug

just vscode DEBUG
