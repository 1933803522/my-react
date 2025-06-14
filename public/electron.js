/* eslint-disable import/no-extraneous-dependencies */
const {
    app, BrowserWindow, ipcMain, dialog
} = require('electron')
const isDev = require('electron-is-dev')
const path = require('path')
const readline = require('readline')
const fs = require('fs')
const exec = require('child_process')
const { productEnvStart, startTaskServer, killTaskServer } = require('./product')
const logger = require('./logger')

let mainWindow
const additionalData = { myKey: 'ccss-electron-app' }
const gotTheLock = app.requestSingleInstanceLock(additionalData)

const tempFile = `${__dirname}/data.json`

const createWindow = async () => {
    mainWindow = new BrowserWindow({
        fullscreenable: false,
        height: 756,
        width: 1344,
        minWidth: 1344,
        minHeight: 756,
        fullscreen: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            sandbox: false
            // preload: `${__dirname}/preload.js`
        },
        // transparent: true,
        // frame: false,
        titleBarStyle: 'default',
        autoHideMenuBar: true,
        title: '中机',
        maximizable: true,
        resizable: true,
        backgroundColor: '#0C1827',
        show: false,
        icon: path.join(__dirname, './icon.png')
    })

    try {
        if (!isDev) {
            const productPort = 8013
            await productEnvStart(productPort)
            mainWindow.loadURL(`http://localhost:${productPort}`)
        } else {
            mainWindow.loadURL('http://localhost:3001')
        }
    } catch (error) {
        console.log('error happened when start frontend', error)
    }

    mainWindow.on('ready-to-show', () => {
        mainWindow.show()
        mainWindow.setAspectRatio(1.778)
    })

    mainWindow.webContents.session.on('will-download', (e, i, wc) => {
        i.once('done', (event, state) => {
            if (state === 'completed') {
                const filePath = event.sender.getSavePath()
                mainWindow.webContents.send('send-download-path', filePath)
            }
        })
    })

    // 渲染进程直接打开窗口，setWindowOpenHandler可以设置安全和权限
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url) {
            return {
                action: 'allow',
                overrideBrowserWindowOptions: {
                    // fullscreenable: false,
                    backgroundColor: '#0C1827',
                    webPreferences: {
                        nodeIntegration: true,
                        contextIsolation: false,
                        sandbox: false
                    },
                    autoHideMenuBar: true,
                    windowType: 'child',
                    icon: path.join(__dirname, './icon.png')
                }
            }
        }
        return { action: 'deny' }
    })

    // 添加redux devtool查看 redux
    // 参考文档 https://www.electronjs.org/zh/docs/latest/tutorial/devtools-extension
    // const reduxDevToolsPath = path.join(
    //     os.homedir(),
    //     process.platform === 'darwin'
    //     // onMacOS
    //         ? '/Library/Application Support/Google/Chrome/Default/Extensions/lmhkpmbekcpmknklioeibfkpmmfibljd/3.1.6_1'
    //     // onWindows
    //         : '\/AppData\/Local\/Google\/Chrome\/User Data\/Default\/Extensions\/lmhkpmbekcpmknklioeibfkpmmfibljd\/3.1.6_1'
    // )
    // await session.defaultSession.loadExtension(reduxDevToolsPath)
}

if (!gotTheLock) {
    console.log('prevent second instance open')
    app.quit()
} else {
    app.whenReady().then(createWindow)

    app.on('window-all-closed', () => {
        console.log('close app')
        if (process.platform !== 'darwin') {
            console.log('app quit')
            app.quit()
        }
        process?.exit()
    })

    app.on('second-instance', (e, c, w, a) => {
        console.log('second-instance try to open')
        if (mainWindow) {
            if (mainWindow.isMinimized()) {
                mainWindow.restore()
            }
            mainWindow.focus()
        }
    })

    // 监听渲染进程发送的消息
    ipcMain.on('update-title', (event, title) => {
        // 更新窗口标题
        if (mainWindow) {
            mainWindow.setTitle(title)
        }
    })

    ipcMain.on('update-window-size', (event, param) => {
        // 更新窗口大小
        if (mainWindow) {
            mainWindow.setSize(param?.width ?? 1920, param?.height ?? 1080)
        }
    })

    // 最大化或最小化
    ipcMain.on('maximize', (event) => {
        if (mainWindow) {
            mainWindow.maximize()
        }
    })

    // 监听渲染进程发送的消息
    ipcMain.on('child-process-cmd', (event, msg) => {
        try {
            const window = BrowserWindow.fromWebContents(event.sender)
            if(window!== mainWindow) {
               return 
            }
            switch (msg?.cmd) {
            case 'remove-childs':
                if (!isDev) {
                    const readJsonData = fs.readFileSync(tempFile, 'utf8')
                    if (readJsonData) {
                        fs.writeFileSync(tempFile, '')
                        if (readJsonData) {
                            Object.values(JSON.parse(readJsonData)).forEach(pid => {
                                logger.info(`关闭${pid}`)
                                if (pid) {
                                    process.kill(pid)
                                }
                            })
                        }
                    }
                }
                break
            default:
                break
            }
        } catch (error) {
            logger.error(error)
        }
    })

    // 开启一个新窗口
    ipcMain.on('openWindow', (_, { url, width, height }) => {
        const childWin = new BrowserWindow({
            fullscreenable: true,
            height: height,
            width: width,
            fullscreen: false,
            // parent: mainWindow, // 设置主窗口为父窗口
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                sandbox: false
            },
            titleBarStyle: 'default',
            autoHideMenuBar: true,
            maximizable: true,
            resizable: true,
            backgroundColor: '#0C1827',
            icon: path.join(__dirname, './icon.png')
        })

        // 窗口添加项目标记
        childWin.isSubWIndow = true

        if (!isDev) {
            childWin.loadURL(`http://localhost:8013${url}`)
        } else {
            childWin.loadURL(`http://localhost:3001${url}`)
        }
    })

    // 开启一个新窗口
    ipcMain.on('sendMsgToSubWindow', (event, msg) => {
        const window = BrowserWindow.fromWebContents(event.sender)
        // 当前窗口
        if (window.isSubWIndow) {
            return
        }
        
        // 找到所有对应projectId的窗口
        BrowserWindow.getAllWindows().forEach((win) => {
            if (win.isSubWIndow) {
                win.webContents.send('receiveMQMsgFormMainWindow',msg)
            }
        })
    })

    ipcMain.on('open-dialog', (event, param) => {
        dialog.showOpenDialog(mainWindow, {
            properties: ['openDirectory'],
            ...param
        }).then((files) => {
            // eslint-disable-next-line no-param-reassign
            event.returnValue = files
        })
    })
    ipcMain.on('save-dialog', (event, param) => {
        dialog.showSaveDialog(mainWindow, {
            ...param
        }).then((files) => {
            // eslint-disable-next-line no-param-reassign
            event.returnValue = files
        })
    })

    // 保存video
    ipcMain.handle('save-video', (event, param) => {
        const { buffer, path: pathVideo, folderPath } = param
        return new Promise((resolve, reject) => {
            // 校验是否存在文件夹
            if (!fs.existsSync(folderPath)) {
                // 如果文件夹不存在，则创建
                fs.mkdirSync(folderPath, { recursive: true })
                console.log(`文件夹已创建: ${folderPath}`)
            } else {
                console.log(`文件夹已存在: ${folderPath}`)
            }
            // 校验是否存在文件，有文件删除
            if (pathVideo && fs.existsSync(pathVideo)) {
                // 如果文件存在，删除文件
                fs.unlinkSync(pathVideo)
            }

            const ffmpegPath = !isDev ? path.resolve(__dirname, '../build/ffmpeg') : path.resolve(__dirname, '../public/ffmpeg')
            const cmd = !isDev ? path.resolve(__dirname, '../build/ffmpeg/ffmpeg') : path.resolve(__dirname, '../public/ffmpeg/ffmpeg')
            console.log('ffmpegPath', ffmpegPath)
            console.log('cmd', cmd)
            // convertBufferToVideo
            const ffmpeg = exec.spawn(cmd, [
                '-i', 'pipe:0', // 输入从标准输入（pipe）流中获取
                '-vcodec', 'libx264', // 使用 H.264 编码
                '-preset', 'ultrafast', // 设置最快的编码预设
                '-an', // 不处理音频
                pathVideo // 输出文件路径
            ], {
                cwd: ffmpegPath
            })

            // 将输入Buffer传输给FFmpeg
            ffmpeg.stdin.write(buffer)
            ffmpeg.stdin.end()

            ffmpeg.on('close', (code) => {
                if (code === 0) {
                    resolve(true)
                    console.log('Video conversion successful!')
                } else {
                    reject(code)
                    console.error('FFmpeg process failed with code', code)
                }
            })

            ffmpeg.on('error', (err) => {
                reject(err)
                console.error('Error while running FFmpeg:', err)
            })
        })
    })

    // 写入文件
    ipcMain.on('save-write-file', (event, param) => {
        const { buffer, path: filePath, folderPath } = param
        if (filePath) {
            if (!fs.existsSync(folderPath)) {
                // 如果文件夹不存在，则创建
                fs.mkdirSync(folderPath, { recursive: true })
                console.log(`文件夹已创建: ${folderPath}`)
            } else {
                console.log(`文件夹已存在: ${folderPath}`)
            }
            const writeStream = fs.createWriteStream(filePath)
            writeStream.write(buffer)
            writeStream.end()

            writeStream.on('finish', () => {
                logger.info('Video file has been written successfully.')
            })

            writeStream.on('error', (err) => {
                logger.error('Error writing video file:', err)
            })
        }
    })

    // 读取文件
    ipcMain.on('read-file', (event, param) => {
        const { path: filePath } = param
        if (fs.existsSync(filePath)) {
            const readStream = fs.createReadStream(filePath)

            readStream.on('data', (chunk) => {
                event.reply('video-data', { data: chunk })
            })

            readStream.on('end', () => {
                event.reply('video-data-end')
            })

            readStream.on('error', (err) => {
                event.reply('video-error', { error: err.message })
            })
        } else {
            event.reply('video-error', { error: '文件不存在' })
        }
    })

    // 读取文件
    ipcMain.handle('read', async (event, param) => {
        try {
            const { path: filePath } = param
            if (fs.existsSync(filePath)) {
                const logContent = fs.readFileSync(filePath, 'utf-8')
                return logContent
            }
            return undefined
        } catch (error) {
            console.error('Error reading log file:', error)
            return `Error: ${error.message}`
        }
    })

    ipcMain.handle('read-log', async (event, param) => {
        const { path: filePath } = param
        const lines = []
        return new Promise((resolve, reject) => {
            if (!fs.existsSync(filePath)) {
                reject(new Error('文件不存在'))
            }
            const stream = fs.createReadStream(filePath, { encoding: 'utf-8' })
            const rl = readline.createInterface({ input: stream })

            rl.on('line', (line) => {
                lines.push(line)
            })

            rl.on('close', () => resolve(lines))
            rl.on('error', (err) => reject(err))
        })
    })

    // 读取软件配置文件
    ipcMain.handle('readAppConfig', (_event, { key }) => {
        return new Promise((resolve) => {
            const fileRead = fs.readFileSync(path.resolve(__dirname, './config.json'), 'utf8')
            const config = JSON.parse(fileRead)
            resolve(key ? config?.[key] : config)
        })
    })

    // 启动c#
    ipcMain.on('startTaskServer', (_event) => {
        startTaskServer()
    })

    // 杀掉c#
    ipcMain.on('killTaskServer', (_event) => {
        killTaskServer()
    })
}
