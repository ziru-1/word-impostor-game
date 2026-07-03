import { Howl, Howler } from 'howler'

export const DEFAULT_VOLUME = 0.35

export const gameMusic = new Howl({
  src: ['/audio/inu_neko_bgm.ogg'],
  loop: true,
  volume: 0.0,
})

export const playGameMusic = () => {
  console.log('[music] playGameMusic called', {
    playing: gameMusic.playing(),
    state: gameMusic.state?.(),
    ctxState: Howler.ctx?.state,
  })

  if (!gameMusic.playing()) {
    const id = gameMusic.play()

    console.log('[music] play() returned id:', id)

    gameMusic.once(
      'play',
      () => {
        console.log('[music] actually started playing')
      },
      id,
    )

    gameMusic.once(
      'playerror',
      (_id, err) => {
        console.log('[music] playerror:', err)
      },
      id,
    )
  }
}

export const stopGameMusic = () => {
  if (gameMusic.playing()) {
    gameMusic.fade(gameMusic.volume(), 0, 1000)
    setTimeout(() => {
      gameMusic.stop()
    }, 1000)
  }
}

export const chatSfx = new Howl({
  src: ['/audio/pop.ogg'],
  volume: DEFAULT_VOLUME,
})
