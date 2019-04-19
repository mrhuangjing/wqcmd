const path = require('path');
const fs = require('fs');
const inquirer = require('inquirer');
const cmd = require('./cmd');
const compressing = require('compressing');
const pump = require('pump');
const isExistsFile = fs.existsSync;

/**
 * 检查文件路径是否存在
 */
function fsExistsSync (path) {
    try {
        fs.accessSync(path, fs.F_OK);
    } catch(e) {
        return false;
    }
    return true;
}

/**
 * 压缩文件夹
 * @param {taskName}
 */
function compress (taskName) {
    // const proPath = path.resolve(); // 项目路径
    // const files = fs.readdirSync(proPath);
    // const tarStream = new compressing.tar.Stream();
    // files.forEach(el => {
    //     if (el != taskName) {
    //         tarStream.addEntry(path.join(proPath, el));
    //     }
    // });
    // const destStream = fs.createWriteStream(path.resolve(`./${taskName}`, `${taskName}.tgz`));
    // pump(tarStream, new compressing.gzip.FileStream(), destStream, err => {
    //     if (err) {
    //       console.error(err);
    //     }
    //     fileWrite(taskName);
    // });
    compressing.zip.compressDir(path.resolve(), path.resolve(`../${taskName}/${taskName}.zip`))
    .then(() => {
        console.log('压缩完成');
    })
    .catch(err => {
        console.error('压缩失败 -> ', err);
        process.exit(1); // 退出进程
    });
}

/**
 * 写入wqcmd.json文件 记录任务名称和入口文件
 */
function fileWrite (taskName, entryFile) {
    return new Promise((resolve, reject) => {
        fs.writeFile('wqcmd.json', `{"taskName": "${taskName}", "entryFile": "${entryFile}"}`, err => {
            if (err) {
                console.log('配置文件生成失败 ->', err);
                resolve();
            }
            resolve('success');
        });
    });
}

/**
 * 创建任务
 */
async function createTask (taskName) {
    const dirPath = path.resolve('../', taskName); // 打包路径
    let instructions = []; // 指令集
    if (!fsExistsSync(dirPath)) {
        instructions.push(`mkdir ${path.resolve('../', taskName)}`);
    }
    instructions.length && await cmd.run(instructions); // 执行指令集

    compress(taskName);
}

/**
 * 用户输入信息确认
 * @returns {Promise<pending>}
 */
async function confirm (taskName) {
    const infos = [{
        type: 'confirm',
        name: 'isOk',
        message: `确认将任务创建在${path.resolve('../', taskName)}`
    }];
    return inquirer.prompt(infos);
}

/**
 * 获取任务名
 * @returns {Promise<pending>}
 */
async function getTask () {
    const questions = [{
        type: 'input',
        name: 'taskName',
        message: '请输入部署任务名称',
        default: () => 'test'
    }];
    return inquirer.prompt(questions);
}

/**
 * 获取任务入口文件名
 */
async function getEntry () {
    const questions = [{
        type: 'input',
        name: 'entryFile',
        message: '请指定入口文件名'
    }];
    return inquirer.prompt(questions);
}

/**
 * 用户交互处理
 * @returns {Promise<resolved>}
 */
async function initInquirer () {
    // if (taskName) {
    //     const {isOk} = await confirm(taskName);
    //     if (isOk) {
    //         createTask(taskName);
    //     } else {
    //         console.log('放弃操作');
    //     }
    // } else {
    //     const {taskName, entryFile} = await getTask();

    //     if (!taskName) {
    //         initInquirer(taskName);
    //         return;
    //     }
    //     initInquirer(taskName);
    // }
    
    const {taskName} = await getTask();
    if (!taskName) {
        initInquirer();
        return ;
    }

    const {entryFile} = await getEntry();
    if (!entryFile) {
        console.log('未指定入口文件，请重新初始化...');
        return ;
    }
    
    const {isOk} = await confirm(taskName);
    if (isOk) {
        const writeSuccess = await fileWrite (taskName, entryFile);
        writeSuccess && createTask(taskName);
    } else {
        console.log('放弃操作');
    }
}

module.exports = () => {
    initInquirer();
};