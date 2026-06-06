import { Howl } from 'howler'

export const DEFAULT_VOLUME = 0.35

export const gameMusic = new Howl({
  src: ['/audio/inu_neko_bgm.ogg'],
  loop: true,
  volume: 0.0,
})

export const playGameMusic = () => {
  if (!gameMusic.playing()) {
    gameMusic.play()
    gameMusic.fade(0, DEFAULT_VOLUME, 500)
  }
}

export const stopGameMusic = () => {
  gameMusic.fade(gameMusic.volume(), 0, 1000)
  setTimeout(() => {
    gameMusic.stop()
  }, 1000)
}
