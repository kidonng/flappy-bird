import p5 from 'p5'

const sketch = (p: p5) => {
  const { innerWidth, innerHeight } = window
  let frames = 0
  let score = 0

  let background: p5.Image
  let bird: p5.Image
  let topPipe: p5.Image
  let bottomPipe: p5.Image

  const birdX = innerWidth / 4
  let birdY = innerHeight / 2
  const birdWidth = 30
  const birdHeight = (birdWidth * 48) / 68
  let gravity = 1
  const elevation = 0.5 * 60

  const pipes: {
    x: number
    topHeight: number
    bottomHeight: number
  }[] = []
  // 104 * .375
  const pipeWidth = 39
  const pipeHeight = (pipeWidth * 640) / 104
  let pipeSpeed = 2
  // Higher factor stands for lager gap
  const pipeFrequency = (60 * 3) / pipeSpeed
  // Larger screen may need a higher factor
  const maxPipes = pipeSpeed * 6

  const init = () => {
    p.background(background)
    const gravityInput = p
      .createElement('label', 'Gravity ')
      .child(
        // @ts-ignore
        p.createInput('1').input((e: InputEvent) => {
          gravity = Number((e.target as HTMLInputElement).value)
        })
      )
      .position(innerWidth * 0.35, innerHeight * 0.45)

    const speedInput = p
      .createElement('label', 'Speed ')
      .child(
        // @ts-ignore
        p.createInput('2').input((e: InputEvent) => {
          pipeSpeed = Number((e.target as HTMLInputElement).value)
        })
      )
      .position(innerWidth * 0.35, innerHeight * 0.5)

    const startButton = p
      .createButton('Start')
      .position(innerWidth / 2, innerHeight * 0.55)
      .mousePressed(() => {
        ;[gravityInput, speedInput, startButton].forEach(el => el.remove())
        start()
      })
  }

  const over = () => {
    window.alert('Game over!')

    frames = score = 0
    birdY = innerHeight / 2
    pipes.length = 0
    p.draw = p.mouseClicked = () => null

    init()
  }

  const start = () => {
    p.draw = () => {
      p.background(background)

      // No lower than the ground
      birdY = Math.min(birdY + gravity, innerHeight - birdHeight)
      p.image(bird, birdX, birdY, birdWidth, birdHeight)

      if (frames++ % pipeFrequency === 0 && pipes.length < maxPipes) {
        const topHeight = pipeHeight * (0.25 + Math.random())
        const bottomHeight =
          (innerHeight - topHeight) * p.constrain(Math.random(), 0.25, 0.75)

        pipes.push({ x: innerWidth, topHeight, bottomHeight })
        score++
      }

      for (const pipe of pipes) {
        const pipeX = (pipe.x -= pipeSpeed)

        // Only draw visible pipes
        if (pipeX > -pipeWidth) {
          p.image(topPipe, pipeX, 0, pipeWidth, pipe.topHeight)
          p.image(
            bottomPipe,
            pipeX,
            innerHeight - pipe.bottomHeight,
            pipeWidth,
            pipe.bottomHeight
          )

          if (
            // Touch the ground
            birdY === innerHeight - birdHeight ||
            // In pipes
            (birdX > pipe.x - birdWidth &&
              // Not out of pipes (0.8 just works)
              birdX < pipe.x + pipeWidth * 0.8 &&
              // At the same height as pipes
              (birdY < pipe.topHeight ||
                birdY > innerHeight - pipe.bottomHeight - birdHeight))
          )
            over()

          // Remove pipes out of sight
          // Low threshold can cause blinking
        } else if (pipeX < innerWidth * -0.5) pipes.shift()
      }

      p.text(score, innerWidth * 0.05, innerHeight * 0.1)
    }

    p.mouseClicked = () => {
      // No higher than the ceiling
      birdY = Math.max(birdY - elevation, 0)
    }
  }

  const loadImages = (...images: string[]) =>
    images.map(image =>
      p.loadImage(
        `https://cdn.jsdelivr.net/gh/HipByte/motion-game/samples/FlappyBird/resources/${image}`
      )
    )

  p.preload = () =>
    ([background, bird, topPipe, bottomPipe] = loadImages(
      'skyline.png',
      'bird_one.png',
      'pipe_down.png',
      'pipe_up.png'
    ))

  p.setup = () => {
    p.createCanvas(innerWidth, innerHeight)
    p.textSize(25)
    init()
  }
}

new p5(sketch, document.getElementById('app')!)
