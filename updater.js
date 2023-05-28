const { dialog } = require("electron")
const { autoUpdater } = require("electron-updater")

autoUpdater.logger = require("electron-log")
autoUpdater.logger.transports.file.level = "info"

module.exports = () => {
    autoUpdater.setFeedURL({
        provider: 'github',
        repo: 'repo',
        owner: 'owner',
        private: true,
        token: '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'
    })
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