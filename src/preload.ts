// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron"
import { LogResult } from "."
import { TimerView } from "./pomodoro"

contextBridge.exposeInMainWorld("api", {
  work: () => ipcRenderer.send("work"),
  pause: () => ipcRenderer.send("pause"),
  longPause: () => ipcRenderer.send("long-pause"),
  squash: () => ipcRenderer.send("squash"),
  quit: () => ipcRenderer.send("quit"),
  handleUpdate: (callback: (event: IpcRendererEvent, timer: TimerView) => void) =>
    ipcRenderer.on("updateTimer", callback),
  handlePlay: (callback: (event: IpcRendererEvent, audio: string) => void) => ipcRenderer.on("play", callback),
  loadLogs: () => ipcRenderer.send("loadLogs"),
  handleLogs: (callback: (event: IpcRendererEvent, logs: LogResult) => void) => ipcRenderer.on("showLogs", callback),
})
