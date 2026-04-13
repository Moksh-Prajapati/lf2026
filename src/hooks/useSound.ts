let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext()
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

export function playDJScratch() {
  const ac = getCtx()
  const t = ac.currentTime

  const osc1 = ac.createOscillator()
  const gain1 = ac.createGain()
  osc1.type = 'sawtooth'
  osc1.frequency.setValueAtTime(800, t)
  osc1.frequency.exponentialRampToValueAtTime(200, t + 0.15)
  osc1.frequency.exponentialRampToValueAtTime(600, t + 0.25)
  osc1.frequency.exponentialRampToValueAtTime(100, t + 0.4)
  gain1.gain.setValueAtTime(0.15, t)
  gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.4)
  osc1.connect(gain1).connect(ac.destination)
  osc1.start(t)
  osc1.stop(t + 0.4)

  const noise = ac.createBufferSource()
  const noiseBuffer = ac.createBuffer(1, ac.sampleRate * 0.3, ac.sampleRate)
  const output = noiseBuffer.getChannelData(0)
  for (let i = 0; i < output.length; i++) output[i] = Math.random() * 2 - 1
  noise.buffer = noiseBuffer
  const noiseGain = ac.createGain()
  noiseGain.gain.setValueAtTime(0.05, t)
  noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3)
  noise.connect(noiseGain).connect(ac.destination)
  noise.start(t)
  noise.stop(t + 0.3)
}

export function playJazzLick() {
  const ac = getCtx()
  const t = ac.currentTime
  const notes = [392, 440, 494, 523, 587]

  notes.forEach((freq, i) => {
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.type = 'triangle'
    osc.frequency.value = freq
    const start = t + i * 0.1
    gain.gain.setValueAtTime(0, start)
    gain.gain.linearRampToValueAtTime(0.12, start + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.12)
    osc.connect(gain).connect(ac.destination)
    osc.start(start)
    osc.stop(start + 0.12)
  })
}

export function play8BitBeat() {
  const ac = getCtx()
  const t = ac.currentTime
  const pattern = [262, 330, 392, 523, 392, 330, 262, 330]

  pattern.forEach((freq, i) => {
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.type = 'square'
    osc.frequency.value = freq
    const start = t + i * 0.06
    gain.gain.setValueAtTime(0.08, start)
    gain.gain.setValueAtTime(0.001, start + 0.05)
    osc.connect(gain).connect(ac.destination)
    osc.start(start)
    osc.stop(start + 0.06)
  })
}

export function playBounce() {
  const ac = getCtx()
  const t = ac.currentTime
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(600, t)
  osc.frequency.exponentialRampToValueAtTime(200, t + 0.15)
  gain.gain.setValueAtTime(0.1, t)
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15)
  osc.connect(gain).connect(ac.destination)
  osc.start(t)
  osc.stop(t + 0.15)
}
