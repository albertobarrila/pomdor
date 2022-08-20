import moment from "moment"

const colorActive = "\u001b[31;1m"
const colorPause = "\u001b[32;1m"

export type Kind = "work" | "pause" | "long-pause" | "idle"

export type Timer = {
  name: string
  icon: (time: string) => string
  type: Kind
  start: moment.Moment
  end: moment.Moment
  image: string
}

export type TimerView = {
  time: string
  type: Kind
  name: string
  progress: number
}

export function toTimerView(timer: Timer, time: string, progress: number): TimerView {
  return {
    time: time,
    type: timer.type,
    name: timer.name,
    progress: progress,
  }
}

export function work(): Timer {
  return {
    icon: (time: string) => `🍅 ${colorActive}${time}`,
    name: "Work 🍅",
    type: "work",
    start: moment(),
    end: moment().add(25, "minutes"),
    image: "../src/images/pomdor-win-red.png",
  }
}

export function pause(): Timer {
  return {
    icon: (time: string) => `🍌 ${colorPause}${time}`,
    name: "Pause 🍌",
    type: "pause",
    start: moment(),
    end: moment().add(5, "minutes"),
    image: "../src/images/pomdor-win-green.png",
  }
}

export function longPause(): Timer {
  return {
    icon: (time: string) => `🍌 ${colorPause}${time}`,
    name: "Pause 🍌🍌",
    type: "long-pause",
    start: moment(),
    end: moment().add(15, "minutes"),
    image: "../src/images/pomdor-win-green.png",
  }
}

export function squash(): Timer {
  return {
    icon: (_time: string) => "🕹️",
    name: "🕹️",
    type: "idle",
    start: moment(),
    end: moment(),
    image: "../src/images/pomdor-win-black.png",
  }
}
