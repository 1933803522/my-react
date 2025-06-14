// eslint-disable-next-line import/no-extraneous-dependencies
const { contextBridge, ipcRenderer, shell } = require('electron')
const { exec } = require('child_process')

contextBridge.exposeInMainWorld(
    'electronAPI', {
        onResponse: (fn) => {
            ipcRenderer.once('send-download-path', (event, args) => {
                return fn(args)
            })
        },
        openDoc: (path) => {
            return shell.openPath(path)
        },
        onOpenDialog: (param) => {
            const filePath = ipcRenderer.sendSync('open-dialog', param)
            return filePath.filePaths[0]
        }
    }
)
