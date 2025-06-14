const log = require('electron-log/main')

log.initialize({ preload: true })
log.transports.console.level = false
// 设置日志文件的位置
const date = new Date()
const dateStr = `${date.getFullYear() }-${ date.getMonth() + 1 }-${ date.getDate()}`
// 初始化 electron-log 实例，并设置文件传输选项
log.transports.file.resolvePathFn = () => `logs\\${ dateStr }.log`
log.transports.file.encoding = 'utf-8'
log.transports.file.maxSize = 10 * 1024 * 1024 // 文件最大不超过 10M
const logger = log
module.exports = log
