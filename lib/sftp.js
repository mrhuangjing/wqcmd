const Client = require('ssh2-sftp-client');
const path = require('path');
const fs = require('fs');
const client = new Client();

async function createConnection () {
    await client.connect({
        host: '192.168.145.37',
        port: '22',
        username: 'wxsq_static',
        password: 'wxsq_static'
    });
}

async function upload (taskName) {
    await createConnection();
    const files = fs.readdirSync(path.resolve(`../${taskName}`));
    if (files.length) {
        const file = files[0];
        return client.put(path.resolve(`../${taskName}`, file), `/export/wxsq/wqcmd/zips/${file}`);
    } else {
        console.log('读取压缩文件失败');
    }
}

/**
 * 通过文件读取获取任务名
 */
function getTaskName () {
    return new Promise((resolve, reject) => {
        fs.readFile('wqcmd.json', (err, data) => {
            if (err) {
                console.error(err);
                resolve();
            }
            const obj = JSON.parse(data.toString());
            resolve(obj.taskName);
        });
    });
}

module.exports = async () => {
    const taskName = await getTaskName();
    if (taskName) {
        upload(taskName).then(res => {
            console.log('上传成功 -> ', res);
            process.exit(1);
        }).catch(err => {
            console.log('上传文件失败 -> ', err);
            process.exit(1);
        });
    } else {
        console.log('读取任务名失败');
    }
};

