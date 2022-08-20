import { app, BrowserWindow, ipcMain, Menu, Notification, Tray } from "electron"
import * as path from "path"
import moment from "moment"
import { Timer, work, pause, longPause, squash, toTimerView } from "./pomodoro"
import { createLogger, format, transports } from "winston"

let tray: Tray | undefined = undefined
let timer: Timer = squash()
let window: BrowserWindow | undefined = undefined
let updater: NodeJS.Timer | undefined = undefined

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  clearInterval(updater)
  app.quit()
}

const logger = createLogger({
  silent: false,
  level: "info",
  format: format.combine(
    format.timestamp(),
    format.printf((info) => {
      return `${info.timestamp} ${info.level}: ${info.message}`
    })
  ),
  transports: [new transports.File({ filename: "pomdor.log" })],
})

const createTray = () => {
  const icon =
    process.platform === "darwin"
      ? path.resolve(__dirname, "../src/images/pomdor-mac.png")
      : path.resolve(__dirname, "../src/images/pomdor-win-black.png")
  tray = new Tray(icon)
  tray.setToolTip("Pomdor")

  if (process.platform !== "darwin") {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: "Work!",
        click: () => {
          timer = work()
          logger.info("pomodoro")
        },
      },
      {
        label: "Pause",
        click: () => {
          timer = pause()
          logger.info("pause")
        },
      },
      {
        label: "Long Pause",
        click: () => {
          timer = longPause()
          logger.info("long pause")
        },
      },
      {
        label: "squash",
        click: () => {
          timer = squash()
          logger.info("!!! squash !!!")
        },
      },
      {
        label: "Quit",
        click: () => {
          clearInterval(updater)
          app.quit()
        },
      },
    ])
    tray.setContextMenu(contextMenu)
  }

  tray.on("click", function () {
    toggleWindow()
  })
}

function update() {
  if (!tray || !window) return

  const date = moment()
  const time = timer.type !== "idle" ? moment(timer.end.diff(date)).format("mm:ss") : "00:00"

  tray.setTitle(timer.icon(time))
  if (process.platform !== "darwin") {
    tray.setToolTip(timer.icon(time))
    tray.setImage(path.resolve(__dirname, timer.image))
  }

  const progress = timer.type !== "idle" ? Math.round((timer.end.diff(date) * 100) / timer.end.diff(timer.start)) : 0
  if (window) window.webContents.send("updateTimer", toTimerView(timer, time, progress))

  if (time === "00:01" && timer.type !== "idle") {
    let audio = path.join(__dirname, "../src/audio/pause.wav")
    if (timer.type === "pause") audio = path.join(__dirname, "../src/audio/work.wav")
    if (timer.type === "long-pause") audio = path.join(__dirname, "../src/audio/long-pause.m4a")
    const notification = new Notification({
      title: "Pomdor",
      body: timer.type === "pause" || timer.type === "long-pause" ? "🍌 Back to Work!!!" : "🍅 Take a Rest...",
      silent: true,
    })
    notification.show()
    window.webContents.send("play", audio)
    timer = squash()
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  createTray()
  await createWindow()
  updater = setInterval(update, 1000)
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    clearInterval(updater)
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
const getWindowPosition = (): { x: number; y: number } => {
  if (!window || !tray) return { x: 0, y: 0 }

  const windowBounds = window.getBounds()
  const trayBounds = tray.getBounds()
  if (process.platform === "darwin")
    return {
      x: Math.round(trayBounds.x - windowBounds.width / 2),
      y: Math.round(trayBounds.y + trayBounds.height + 4),
    }

  return {
    x: Math.round(trayBounds.x - windowBounds.width / 2),
    y: Math.round(trayBounds.y - windowBounds.height),
  }
}

const createWindow = async (): Promise<void> => {
  // Create the browser window.
  window = new BrowserWindow({
    width: 320,
    height: 450,
    show: false,
    frame: false,
    fullscreenable: false,
    resizable: false,
    transparent: true,
    hasShadow: false,
    skipTaskbar: true,
    webPreferences: {
      backgroundThrottling: false,
      preload: path.join(__dirname, "preload.js"),
    },
  })

  // and load the index.html of the app.
  await window.loadFile(path.join(__dirname, "../src/index.html"))

  // Open the DevTools.
  //window.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.

app.on("activate", async () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    await createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
const toggleWindow = () => {
  window && window.isVisible() ? window.hide() : showWindow()
}

const showWindow = () => {
  if (window) {
    const position = getWindowPosition()
    window.setPosition(position.x, position.y)
    window.show()
  }
}

ipcMain.on("show-window", () => {
  showWindow()
})

ipcMain.on("work", () => {
  timer = work()
  logger.info("pomodoro")
})

ipcMain.on("pause", () => {
  timer = pause()
  logger.info("pause")
})

ipcMain.on("long-pause", () => {
  timer = longPause()
  logger.info("long-pause")
})

ipcMain.on("squash", () => {
  timer = squash()
  logger.info("!!! squash !!!")
})

ipcMain.on("quit", () => {
  clearInterval(updater)
  app.quit()
})
