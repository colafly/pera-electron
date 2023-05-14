const { app, globalShortcut } = require('electron')
const { clipboard } = require('electron')
const { net } = require('electron')
var robot = require("robotjs")
const path = require('path')
const {
  BrowserWindow,
  ipcMain
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

  // listen for the 'text' event from the HTML file
  ipcMain.on('text', (event, text) => {
    // update the text in the main process
    app.hide();
    setTimeout(() => {
      robot.typeStringDelayed(text, 800)
    }, 300)
  });

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
        response.setEncoding('utf-8')
        response.on('data', (chunk) => {
          var arr = JSON.parse(chunk)
          win.show();
          win.webContents.send('json-array', arr);
          
          // Alternative: Doing in-line replacement instead
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

