const { dialog } = require("electron")
const { autoUpdater } = require("electron-updater")

autoUpdater.logger = require("electron-log")
autoUpdater.logger.transports.file.level = "info"

module.exports = () => {
    autoUpdater.checkForUpdates().then(info => {
        if (info.updateAvailable) {
            autoUpdater.downloadUpdate().then(
                () => {  
                    autoUpdater.quitAndInstall(false, true)
                }
            )
        }
    })
}