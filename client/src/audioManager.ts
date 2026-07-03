import { Howl, Howler } from 'howler'

export const DEFAULT_VOLUME = 0.35

export const gameMusic = new Howl({
  src: ['/audio/inu_neko_bgm.ogg'],
  loop: true,
  volume: 0.0,
  preload: true,
})

export const unlockGameAudio = () => {
  if (Howler.ctx?.state === 'suspended') {
    Howler.ctx.resume()
  }
}

export const playGameMusic = () => {
  if (gameMusic.playing()) return

  gameMusic.play()

  gameMusic.once('play', () => {
    gameMusic.fade(0, DEFAULT_VOLUME, 500)
  })
}

export const stopGameMusic = () => {
  if (!gameMusic.playing()) return

  gameMusic.fade(gameMusic.volume(), 0, 800)

  setTimeout(() => {
    gameMusic.stop()
  }, 800)
}

export const chatSfx = new Howl({
  src: ['/audio/pop.ogg'],
  volume: DEFAULT_VOLUME,
})
