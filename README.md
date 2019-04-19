# wqcmd
`wqcmd` 是完成node服务部署的脚手架工具。主要用于
(1)项目压缩包的生成 `wqcmd init`
(2)同步代码到开发机和npm `wqcmd release`
(3)解压项目包并开启pm2服务
其中，(1)(2)由业务开发在本机完成，(3)在开发机和IDC机器完成

## 安装
```bash
$ npm install -g wqcmd --registry="http://192.168.192.88:4876"
```