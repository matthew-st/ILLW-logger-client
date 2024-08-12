import path from 'path'
import { app, ipcMain } from 'electron'
import serve from 'electron-serve'
import { createWindow } from './helpers'
import FileHandler from './helpers/files'
import handleSockets from './helpers/websocketClient'
import UDPHandler from './helpers/udpServer'
import WebsocketClient from './helpers/websocketClient'
const isProd = process.env.NODE_ENV === 'production'

if (isProd) {
  serve({ directory: 'app' })
}

; (async () => {
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
  let files = new FileHandler(app)
  let udp = new UDPHandler(mainWindow.webContents)
  let ws = new WebsocketClient(files.config.get('authToken'))
  ipcMain.on('authToken', async (event, arg) => {
    files.config.set('authToken', arg)
    event.reply('snackbar', {
      message: 'Websocket authentication key successfully updated and will apply on next start',
      severity: 'success',
      icon: 'key'
    })
  })

  // These handlers are used to transmit messages browser side, and require no server action.
  ipcMain.on('delete', async (event, arg) => { event.reply('delete', arg) })
  ipcMain.on('edit', async (event, arg) => { event.reply('edit', arg) })

  ipcMain.on('log_qso', async(event, arg) => {})
})()

app.on('window-all-closed', () => {
  app.quit()
})



