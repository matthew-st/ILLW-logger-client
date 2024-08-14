import path from 'path'
import { app, ipcMain } from 'electron'
import serve from 'electron-serve'
import { createWindow } from './helpers'
import FileHandler from './helpers/fileHandler'
import UDPHandler from './helpers/udpServer'
import WebsocketClient from './helpers/websocketClient'
import * as nanoid from 'nanoid'
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
    autoHideMenuBar: true
  })

  if (isProd) {
    await mainWindow.loadURL('app://./home')
  } else {
    const port = process.argv[2]
    await mainWindow.loadURL(`http://localhost:${port}/home`)
    mainWindow.webContents.openDevTools()
  }
  let files = new FileHandler(app)
  let ws = new WebsocketClient(files.config, mainWindow.webContents)

  setTimeout(() => {
    let udp = new UDPHandler(mainWindow.webContents)
    udp.on('n1mm_qso', (qso) => {
      qso.add = true
      mainWindow.webContents.send('edit', qso)
    })
  }, 10000)
  setInterval(() => {
    // Handle unfulfilled actions
    if (ws.ws?.OPEN) {
      if (files.actions.get().filter(val => val.fulfilled == false).length > 0) {
        mainWindow.webContents.send('snackbar', {
          message: 'Replaying unfulfilled actions',
          severity: 'info',
          icon: 'replay'
        })
        ws.sendJson({
          op: 2,
          actions: files.actions.get().filter(val => val.fulfilled == false)
        })
      } 
    }
  }, 1000 * 60 * 5)

  // These handlers are used to transmit messages browser side, and require no server action.
  ipcMain.on('delete', async (event, arg) => { event.reply('delete', arg) })
  ipcMain.on('edit', async (event, arg) => { event.reply('edit', arg) })
  ipcMain.on('notes', async (event, arg) => { event.reply('notes', arg) })

  ipcMain.on('authToken', async (event, arg) => {
    files.config.set('authToken', arg)
    event.reply('snackbar', {
      message: 'Websocket authentication key successfully updated',
      severity: 'success',
      icon: 'key'
    })
  })

  ipcMain.on('add_qso', async(event, arg) => {
    let action = {
      type:'add',
      qso: arg.qso,
      opCall: arg.operatorCall,
      opId: nanoid.nanoid(9)
    }
    files.actions.add(action)
    mainWindow.webContents.send('qso_made', arg.qso)
    ws.doAction(action)
  })
  ipcMain.on('edit_qso', async(event, arg) => {
    let action = {
      type: 'edit',
      qso: arg.qso,
      opCall: arg.opCall,
      opId: nanoid.nanoid(9)
    }
    files.actions.add(action)
    mainWindow.webContents.send('qso_edit', arg.qso)
    ws.doAction(action)
  })
  ipcMain.on('delete_qso', async(event, arg) => {
    let action = {
      type: 'delete',
      qso: arg.qso,
      opCall: arg.opCall,
      opId: nanoid.nanoid(9)
    }
    files.actions.add(action)
    mainWindow.webContents.send('qso_delete', arg.qso)
    ws.doAction(action)
  })
})()

app.on('window-all-closed', () => {
  app.quit()
})



