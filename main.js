const { app, globalShortcut } = require('electron')
const { clipboard } = require('electron')
const { net } = require('electron')
var robot = require("robotjs")
const path = require('path')
const {
  BrowserWindow,
  ipcMain,
  Menu,
  MenuItem
} = require("electron");

app.whenReady().then(() => {
  let win = new BrowserWindow({
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });
  win.loadFile("index.html");
  win.hide();
  win.once ('closed', () => { win = null; });
  win.on ('blur', () => { win.hide (); });

  globalShortcut.register('CommandOrControl+Shift+S', () => {
    robot.keyTap('c', 'command')
    setTimeout(() => {
      const selectedText = clipboard.readText().trim()
      const data = {
        answer: selectedText
      }
      const postData = JSON.stringify(data)
      const options = {
        method: 'POST',
        protocol: 'https:',
        hostname: 'pera.school',
        path: '/api/reword',
        headers: {
          'Content-Type': 'application/json'
        }
      }

      // Create the request
      const request = net.request(options);

      // Handle the response
      request.on('response', (response) => {
        response.on('data', (chunk) => {
          var arr = JSON.parse(chunk)
          const menu = new Menu()
          for (let i = 0; i < arr.length; i++) {
            const menuItem = new MenuItem({
              label: arr[i].text,
              click: () => {
                // Do something when the menu item is clicked.
                setTimeout(() => {
                  robot.typeStringDelayed(arr[i].text, 1200)
                }, 200)
              }
            });
            menu.append(menuItem)
          }
          menu.popup();
          
          // Alternative: Consider doing in-line replacement instead when text is too long
          // robot.typeStringDelayed(arr[i]['text'], 800)
          // var len = arr.length
          // var i = 0 
          // globalShortcut.register('Space', () => {
          //   i = i < len-1 ? i + 1 : 0
          //   robot.typeStringDelayed(arr[i]['text'], 800)
          // })
        })
      });

      // Handle errors
      request.on('error', (error) => {
        console.error(`Request error: ${error}`)
      });

      // Send the request
      request.write(postData)
      request.end()
    }, 200)
  })
});

