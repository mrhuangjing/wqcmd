const compressing = require('compressing');
const path = require('path');
const fs = require('fs');
const cmd = require('./cmd');

/**
 * 读取wqcmd.json文件，获取任务名和入口页面名称
 */
function fileRead (filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, data) => {
            if (err) {
                console.error('读取配置文件wqcmd.json失败 ->', err); // 后续写到日志里
                resolve();
            }
            const obj = JSON.parse(data.toString());
            resolve(obj);
        });
    });
}

/**
 * unzip
 */
function unzip (taskName) {
    return new Promise((resolve, reject) => {
        compressing.zip.uncompress(path.resolve(`./zips/${taskName}.zip`), path.resolve(`./projects/${taskName}`))
        .then(() => {
            console.log(`${taskName}.zip解压完成`);
            resolve('success');
        })
        .catch(err => {
            console.error('解压失败 -> ', err);
            resolve();
        });
    });
}

/**
 * createServer
 */
async function createServer (taskName) {
    let scripts = [`pm2 delete ${taskName}`];
    try {
        await cmd.run(scripts);
    } catch (e) {
        // ignore
    }
    const dirs = fs.readdirSync(path.resolve(`./projects/${taskName}`));
    if (dirs.length) {
        const app = dirs[0]; // APP项目目录

        const filePath = path.resolve(`./projects/${taskName}/${app}/wqcmd.json`);
        const {entryFile} = await fileRead(filePath);

        scripts = [
            `cd projects`,
            `cd ${taskName}`,
            `cd ${app}`,
            `pm2 start ${entryFile} --name ${taskName}`
        ];

        try {
            const info = await cmd.run(scripts);
            console.log('开启服务成功', info);
        } catch (e) {
            console.log('服务启动失败 -> ', e);
        }
    }
    
}

module.exports = async taskName => {
    if (taskName) {
        const isOk = await unzip(taskName);
        if (isOk) {
            createServer(taskName);            
        } else {
            console.log('开启服务失败');
        }
    } else {
        console.log('请输入任务名');
    }
    
};