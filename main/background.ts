import path from 'path'
import { app, ipcMain } from 'electron'
import serve from 'electron-serve'
import { createWindow } from './helpers'
import { WebSocket } from 'ws'
import ConfigHandler from './helpers/config'
const isProd = process.env.NODE_ENV === 'production'

if (isProd) {
  serve({ directory: 'app' })
}

;(async () => {
  await app.whenReady()

  const mainWindow = createWindow('main', {
    width: 1000,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  if (isProd) {
    await mainWindow.loadURL('app://./home')
  } else {
    const port = process.argv[2]
    await mainWindow.loadURL(`http://localhost:${port}/home`)
    mainWindow.webContents.openDevTools()
  }
  const config = new ConfigHandler(app)
  
  ipcMain.on('authToken', async (event, arg) => {
    config.set('authToken', arg)
    event.reply('snackbar', {
      message: 'Websocket authentication key successfully updated and will apply on next start',
      severity: 'success',
      icon: 'key'
    })
  })

  ipcMain.on('delete', async (event, arg) => {
    event.reply('delete', arg)
  })
  

  // handleSockets(false, )
})()

app.on('window-all-closed', () => {
  app.quit()
})

function handleSockets(retry = true, token) {
  let ws = new WebSocket('wss://gb0csl.ocld.cc')

  ws.on('open', () => {
    ipcMain.emit('snackbar', {
      message: 'Websocket connection successful',
      severity: 'success'
    })
    retry = false
    ws.send(JSON.stringify({
      op: 0,
      token: token
    }))
  })

  ws.on('message', (msg) => {
    const data = JSON.parse(msg.toString())
    switch (data.op) {
      case 0:
        if (data.unauthenticated) {
          ipcMain.emit('snackbar', {
            message: 'Incorrect token provided. Check settings.',
            severity: 'error',
            icon: 'keyoff'
          })
        }
        if (data.chunk_status[0] == 1) {
          ipcMain.emit('snackbar', {
            message: `Syncronising ${data.total_amount} QSOs from server.`,
            severity: 'info',
            icon: 'sync'
          })
        }
        ipcMain.emit('initialise', data)
        break;
    }
  })

  ws.on('close', () => {
    if (!retry) {
      ipcMain.emit('snackbar', {
        message: 'Websocket connection lost. Retrying connection in 5s',
        severity: 'error'
      })
    }
    ws = null
    setTimeout(() => {
      handleSockets(true, token)
    }, 5000)
  })
}

