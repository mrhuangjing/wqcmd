#!/usr/bin/env node
const program = require('commander');
const init = require('../lib/init');
const sftp = require('../lib/sftp'); 
const serve = require('../lib/serve'); 

program
    .version(require('../package').version, '-v, --version')
    .usage('<command> [options]');

program.command('init [task]')
    .description('创建一个部署任务')
    .action((...args) => {
        init.apply(null, args);
    });

program.command('release')
    .description('ftp上传压缩代码包')
    .action(() => {
        sftp();
    });

program.command('serve [task]')
    .description('解压代码包并开启pm2服务')
    .action((...args) => {
        serve.apply(null, args);
    });

program.parse(process.argv);