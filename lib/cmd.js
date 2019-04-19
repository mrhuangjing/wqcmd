const {exec} = require('child_process');

function _run(cmd, env) {
    return new Promise((resolve, reject) => {
        exec(cmd, env, (error, stdout, stderr) => {
            if (error) {
                return reject(error);
            }
            resolve(stdout || stderr);
        });
    })
}

async function run(cmds, env) {
    const cmd = cmds.join(' && ');
    return await _run(cmd, env);
}

module.exports = {
    run
}