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

  // These handlers are used to transmit messages browser side, and require no server action.
  ipcMain.on('delete', async (event, arg) => { event.reply('delete', arg) })
  ipcMain.on('edit', async (event, arg) => { event.reply('edit', arg) })



  // handleSockets(false, )
})()

app.on('window-all-closed', () => {
  app.quit()
})

function handleSockets(retry = true, token, ipc: Electron.WebContents) {
  let ws = new WebSocket('wss://gb0csl.ocld.cc')

  ws.on('open', () => {
    ipc.send('snackbar', {
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
          return ipc.send('snackbar', {
            message: 'Incorrect token provided. Check settings.',
            severity: 'error',
            icon: 'keyoff'
          })
        }
        if (data.chunk_status[0] == 1) {
          ipc.send('snackbar', {
            message: `Syncronising ${data.total_amount} QSOs from server.`,
            severity: 'info',
            icon: 'sync'
          })
        }
        ipc.send('initialise', data)
        break;
    }
  })

  ws.on('close', () => {
    if (!retry) {
      ipc.send('snackbar', {
        message: 'Websocket connection lost. Retrying connection in 5s',
        severity: 'error'
      })
    }
    ws = null
    setTimeout(() => {
      handleSockets(true, token, ipc)
    }, 5000)
  })
}

