import { IpcRenderer, IpcRendererEvent } from "electron"
import { LogResult } from "."
import { TimerView } from "./pomodoro"

export {}

declare global {
  interface Window {
    api: {
      work: () => void
      pause: () => void
      longPause: () => void
      squash: () => void
      quit: () => void
      handleUpdate: (callback: (event: IpcRendererEvent, timer: TimerView) => void) => IpcRenderer
      handlePlay: (callback: (event: IpcRendererEvent, audio: string) => void) => IpcRenderer
      loadLogs: () => void
      handleLogs: (callback: (event: IpcRendererEvent, logs: LogResult) => void) => IpcRenderer
    }
  }
}
