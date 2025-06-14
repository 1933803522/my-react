const path = require('path')
const express = require('express')
const fs = require('fs')

const appEx = express()
const exec = require('child_process')
const iconv = require('iconv-lite')
const logger = require('./logger')

const binaryEncoding = 'binary'
// windows，都使用的是CP936(近似于gb2312)编码，nodejs以utf8识别是会出问题。
const encoding = 'cp936'
const tempFile = `${__dirname}/data.json`
const TYPE = {
    JAVA: 'javaServer',
    TASK_SERVER: 'taskServer',
    HARDWARE_CONNECTOR: 'hardwareConnector'
}

// 校验pid是否存在
const isProcessAlive = (pid) => {
    try {
        if (pid) {
            process.kill(pid, 0)
            return true // 进程存在
        }
        return false
    } catch (err) {
        return false // 进程不存在
    }
}

const writeJsonData = (jsonDataToWrite) => {
    fs.writeFileSync(tempFile, JSON.stringify(jsonDataToWrite, null, 2))
}

const readJsonData = () => {
    const fileRead = fs.readFileSync(tempFile, 'utf8')
    return fileRead ? JSON.parse(fileRead) : { javaServer: null, taskServer: null }
}

const runCommand = ({
    type,
    command,
    args,
    options
}) => {
    return new Promise((resolve, reject) => {
        try {
            let child
            if (args) {
                child = exec.spawn(command, args, options)
            } else {
                child = exec.spawn(command, options)
            }
            child.unref()
            const readData = readJsonData()
            if (readData) {
                writeJsonData({ ...readData, [type]: child.pid })
            }

            child.on('error', (data) => {
                const output = iconv.decode(data, encoding)
                logger.error(`${type} child process error ${output}`)
            })

            child.on('close', (code) => {
                logger.info(`${type} child process exited with code ${code}`)
            })
            setTimeout(() => {
                resolve(child)
            }, 1000)
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
}

const startFrontEnd = (port) => {
    return new Promise((resolve, reject) => {
        // start frontend
        const reactBuildPath = path.join(__dirname, '../build')
        appEx.use(express.static(reactBuildPath))
        appEx.get('/*', (req, res) => {
            res.sendFile(path.join(__dirname, '../build/index.html'))
        })
        appEx.listen(port, () => {
            console.log(`前端服务以启动,端口号为：${port}`)
            resolve()
        })
    })
}

const startClj = async () => {
    const javaStartCmd = ['-jar', 'clj-backend.jar']

    // 子进程path
    const buildPath = path.resolve(__dirname, '../build')
    // JDK
    const javaPath = path.resolve(__dirname, '../build/jdk11.0.17/bin/java')

    const readPid = readJsonData()
    const javaPid = isProcessAlive(readPid[TYPE.JAVA])
    if (!javaPid) {
        // 启动java
        await runCommand({
            type: TYPE.JAVA,
            command: javaPath,
            args: javaStartCmd,
            options: {
                stdio: 'ignore',
                detached: true,
                cwd: buildPath,
                encoding: binaryEncoding
            }
        })
    }
}

const startTaskServer = async () => {
    // TaskServer 启动path
    const taskServerPath = path.resolve(__dirname, '../build/taskServer')

    // C#  TaskServer  启动消息总线，子任务
    const cTaskServerPath = path.join(__dirname, '../build/taskServer/TaskServer')

    const readPid = readJsonData()
    const taskServerPid = isProcessAlive(readPid[TYPE.TASK_SERVER])
    if (!taskServerPid) {
        // 启动taskServer
        await runCommand({
            type: TYPE.TASK_SERVER,
            command: cTaskServerPath,
            options: {
                stdio: 'ignore',
                cwd: taskServerPath,
                detached: true,
                encoding: binaryEncoding
            }
        })
    }
}

const killTaskServer = () => {
    const readPid = readJsonData()
    const pid = readPid[TYPE.TASK_SERVER]
    if (pid) {
        process.kill(pid)
        writeJsonData({ ...readData, [TYPE.TASK_SERVER]: null })
    }
}


/**
 *
 *
 * 子进程描述
 * 1. 所有子进程都和主进程没有关联
 * 2. 所有子进程都可以独立存在，主进程关闭子进程可以不关闭
 * 3. 主进程重新打开后，根据判断pid子进程是否还活着
 *    3.1 方式：启动子进程获取子进程pid：写入程序临时文件，保存pid，再次打开读取临时文件找到对应的pid进项校验
 *    3.2 还不知道合不合理？先这么搞!!!
 */
const productEnvStart = async (port) => {
    try {
        // 等前端启动
        await startFrontEnd(port)
        // 这俩不用等 在页面上等
        startClj()
        startTaskServer()
    } catch (err) {
        logger.error(err)
    }
}

module.exports = {
    productEnvStart,
    killTaskServer,
    startTaskServer
}
