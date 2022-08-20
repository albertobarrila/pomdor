import { IpcRenderer, IpcRendererEvent } from "electron"
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
    }
  }
}
