import type { Sound } from './sounds'

export type AudioPlayer = { play: (sound: Sound, volume: number) => void }

/** Synthesised sound effects; silent until `unlock` runs from a user gesture. */
export type GameAudio = AudioPlayer & { unlock: () => void; dispose: () => void }

type Voice = { context: AudioContext; output: AudioNode; noise: AudioBuffer; volume: number }

type Tone = { wave: OscillatorType; from: number; to: number; duration: number; gain: number; delay?: number }

type Burst = { frequency: number; duration: number; gain: number; filter?: BiquadFilterType; delay?: number }

const MASTER_VOLUME = 0.45
const SILENCE = 0.0001
const VICTORY_NOTES = [523, 659, 784, 1047]

export function createGameAudio(): GameAudio {
  let voice: Omit<Voice, 'volume'> | null = null

  return {
    unlock() {
      if (!voice && typeof AudioContext !== 'undefined') {
        const context = new AudioContext()
        const output = context.createGain()
        output.gain.value = MASTER_VOLUME
        output.connect(context.destination)
        voice = { context, output, noise: whiteNoise(context) }
      }
      if (voice?.context.state === 'suspended') void voice.context.resume()
    },
    play(sound, volume) {
      if (!voice || volume <= 0) return
      SOUNDS[sound]({ ...voice, volume })
    },
    dispose() {
      void voice?.context.close()
      voice = null
    },
  }
}

const SOUNDS: Record<Sound, (voice: Voice) => void> = {
  pistol: (voice) => {
    burst(voice, { frequency: 2400, duration: 0.18, gain: 0.8 })
    tone(voice, { wave: 'square', from: 190, to: 50, duration: 0.12, gain: 0.3 })
  },
  rifle: (voice) => {
    burst(voice, { frequency: 3200, duration: 0.1, gain: 0.6 })
    tone(voice, { wave: 'square', from: 240, to: 80, duration: 0.07, gain: 0.22 })
  },
  dryFire: (voice) => tone(voice, { wave: 'square', from: 1100, to: 900, duration: 0.03, gain: 0.12 }),
  alert: (voice) => {
    tone(voice, { wave: 'square', from: 660, to: 990, duration: 0.09, gain: 0.12 })
    tone(voice, { wave: 'square', from: 990, to: 1320, duration: 0.09, gain: 0.12, delay: 0.1 })
  },
  enemyShot: (voice) => tone(voice, { wave: 'sawtooth', from: 1400, to: 180, duration: 0.18, gain: 0.25 }),
  enemyHurt: (voice) => tone(voice, { wave: 'square', from: 520, to: 260, duration: 0.1, gain: 0.18 }),
  enemyDeath: (voice) => {
    burst(voice, { frequency: 900, duration: 0.5, gain: 0.5 })
    tone(voice, { wave: 'sawtooth', from: 420, to: 40, duration: 0.55, gain: 0.22 })
  },
  playerHurt: (voice) => tone(voice, { wave: 'triangle', from: 220, to: 70, duration: 0.22, gain: 0.45 }),
  playerDeath: (voice) => {
    tone(voice, { wave: 'sawtooth', from: 300, to: 30, duration: 1.2, gain: 0.35 })
    burst(voice, { frequency: 500, duration: 1, gain: 0.3 })
  },
  pickup: (voice) => {
    tone(voice, { wave: 'square', from: 700, to: 1100, duration: 0.07, gain: 0.12 })
    tone(voice, { wave: 'square', from: 1100, to: 1650, duration: 0.08, gain: 0.12, delay: 0.07 })
  },
  door: (voice) => {
    burst(voice, { frequency: 320, duration: 0.55, gain: 0.35 })
    tone(voice, { wave: 'sawtooth', from: 75, to: 55, duration: 0.55, gain: 0.12 })
  },
  locked: (voice) => {
    tone(voice, { wave: 'square', from: 170, to: 160, duration: 0.12, gain: 0.18 })
    tone(voice, { wave: 'square', from: 170, to: 160, duration: 0.12, gain: 0.18, delay: 0.16 })
  },
  complete: (voice) =>
    VICTORY_NOTES.forEach((frequency, index) =>
      tone(voice, { wave: 'square', from: frequency, to: frequency, duration: 0.14, gain: 0.14, delay: index * 0.12 }),
    ),
}

function tone(voice: Voice, { wave, from, to, duration, gain, delay = 0 }: Tone): void {
  const { context } = voice
  const start = context.currentTime + delay
  const oscillator = context.createOscillator()
  oscillator.type = wave
  oscillator.frequency.setValueAtTime(from, start)
  oscillator.frequency.exponentialRampToValueAtTime(to, start + duration)
  oscillator.connect(envelope(voice, gain, start, duration))
  oscillator.start(start)
  oscillator.stop(start + duration)
}

function burst(voice: Voice, { frequency, duration, gain, filter = 'lowpass', delay = 0 }: Burst): void {
  const { context } = voice
  const start = context.currentTime + delay
  const source = context.createBufferSource()
  source.buffer = voice.noise
  const shaping = context.createBiquadFilter()
  shaping.type = filter
  shaping.frequency.value = frequency
  source.connect(shaping).connect(envelope(voice, gain, start, duration))
  source.start(start, Math.random() * (voice.noise.duration - duration), duration)
}

function envelope(voice: Voice, gain: number, start: number, duration: number): GainNode {
  const node = voice.context.createGain()
  node.gain.setValueAtTime(gain * voice.volume, start)
  node.gain.exponentialRampToValueAtTime(SILENCE, start + duration)
  node.connect(voice.output)
  return node
}

function whiteNoise(context: AudioContext): AudioBuffer {
  const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate)
  const samples = buffer.getChannelData(0)
  for (let index = 0; index < samples.length; index++) samples[index] = Math.random() * 2 - 1
  return buffer
}
