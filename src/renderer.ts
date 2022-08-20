// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process unless
// nodeIntegration is set to true in webPreferences.
// Use preload.js to selectively enable features

const work = document.getElementById("js-work")
if (work)
  work.addEventListener("click", () => {
    window.api.work()
  })

const pause = document.getElementById("js-pause")
if (pause)
  pause.addEventListener("click", () => {
    window.api.pause()
  })

const longPause = document.getElementById("js-long-pause")
if (longPause)
  longPause.addEventListener("click", () => {
    console.log("longPause")
    window.api.longPause()
  })

const squash = document.getElementById("js-squash")
if (squash)
  squash.addEventListener("click", () => {
    window.api.squash()
  })

const quit = document.getElementById("js-quit")
if (quit)
  quit.addEventListener("click", () => {
    window.api.quit()
  })

const progressCurrent = document.querySelectorAll(".js-progress-current")
const drawProgress = () => {
  //progressCurrent.forEach((path: SVGPathElement) => {
  const path = progressCurrent[0] as SVGPathElement
  // Get the length of the path
  const length = path.getTotalLength()

  // Just need to set this once manually on the .meter element and then can be commented out
  // path.style.strokeDashoffset = length;
  // path.style.strokeDasharray = length;

  // Get the value of the meter
  const dataValue = (path.parentNode as HTMLElement).getAttribute("data-value")
  const value = parseInt(dataValue ?? "0")
  // Calculate the percentage of the total length
  const to = length * ((100 - value) / 100)
  // Trigger Layout in Safari hack https://jakearchibald.com/2013/animated-line-drawing-svg/
  path.getBoundingClientRect()
  // Set the Offset
  path.style.strokeDashoffset = `${Math.max(0, to)}`
  //})
}

window.addEventListener("DOMContentLoaded", () => {
  drawProgress()
})

const progress = document.getElementById("js-progress")
const progressTime = document.getElementById("js-progress-time")
const stepName = document.getElementById("js-step-name")

window.api.handleUpdate((_event, timer) => {
  if (progressTime) progressTime.innerHTML = timer.time
  if (progress) progress.setAttribute("data-value", `${timer.progress}`)
  drawProgress()

  stepName!.innerHTML = timer.name

  document.body.classList.remove("is-pause")
  document.body.classList.remove("is-long-pause")
  document.body.classList.remove("is-null")
  if (timer.type === "pause") document.body.classList.add("is-pause")
  if (timer.type === "long-pause") document.body.classList.add("is-long-pause")
  if (timer.type === "idle") document.body.classList.add("is-null")
})

window.api.handlePlay(async (_event, audio: string) => {
  const player = new Audio(audio)
  await player.play()
})
