const Canvas = require('canvas')
const {ImageData} = Canvas
const path = require('path')
const fs = require('fs-extra')
const snapshot = require('../src/snapshot')

const r1 = {top: 227, left: 214, width: 824, height: 824}
const r2 = {top: r1.top + r1.height + 36, left: 214, width: 824, height: 824}
const padding = 80
let canvas
let context
let screen

;(async () => {
  try {
    screen = await snapshot()

    canvas = new Canvas(screen.width, screen.height)
    context = canvas.getContext('2d')
    context.drawImage(screen, 0, 0, screen.width, screen.height)

    for (let y = padding; y < r1.height - padding; y++) {
      for (let x = padding; x < r1.width - padding; x++) {
        const {data: c1} = context.getImageData(x + r1.left, y + r1.top, 1, 1)
        const {data: c2} = context.getImageData(x + r2.left, y + r2.top, 1, 1)
        if ((255 - Math.abs(c1[0] - c2[0]) * 0.297 - Math.abs(c1[1] - c2[1]) * 0.593 - Math.abs(c1[2] - c2[2]) * 0.11) / 255 < 0.9) {
          c1[0] = 0
          c1[1] = 0
          c1[2] = 0
          const imageData = new ImageData(new Uint8ClampedArray(c1), 1, 1)
          context.putImageData(imageData, x + r1.left, y + r1.top)
        }
      }
    }

    await fs.writeFile(path.join(__dirname, '../temp/screen.png'), canvas.toBuffer())
  } catch (e) {
    console.error(e)
  }
})()

