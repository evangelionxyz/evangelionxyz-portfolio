// Web Audio API micro synthesizer for gamified clicks and target acquisition
class GamifiedAudio {
  private ctx: AudioContext | null = null
  private enabled: boolean = false

  public setEnabled(enable: boolean) {
    this.enabled = enable
    if (enable && !this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
  }

  public isEnabled(): boolean {
    return this.enabled
  }

  public playHover() {
    if (!this.enabled || !this.ctx) return
    try {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume()
      }
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(440, this.ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.04)

      gain.gain.setValueAtTime(0.015, this.ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.04)

      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start()
      osc.stop(this.ctx.currentTime + 0.04)
    } catch {
      // AudioContext policy catch
    }
  }

  public playClick() {
    if (!this.enabled || !this.ctx) return
    try {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume()
      }
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(880, this.ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(220, this.ctx.currentTime + 0.07)

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.07)

      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start()
      osc.stop(this.ctx.currentTime + 0.07)
    } catch {
      // AudioContext policy catch
    }
  }

  public playLaser() {
    if (!this.enabled || !this.ctx) return
    try {
      if (this.ctx.state === 'suspended') this.ctx.resume()
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(840, this.ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + 0.08)
      gain.gain.setValueAtTime(0.035, this.ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.08)
      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start()
      osc.stop(this.ctx.currentTime + 0.08)
    } catch {
      // AudioContext policy catch
    }
  }

  public playExplosion() {
    if (!this.enabled || !this.ctx) return
    try {
      if (this.ctx.state === 'suspended') this.ctx.resume()
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(180, this.ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(35, this.ctx.currentTime + 0.16)
      gain.gain.setValueAtTime(0.05, this.ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.16)
      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start()
      osc.stop(this.ctx.currentTime + 0.16)
    } catch {
      // AudioContext policy catch
    }
  }

  public playScore() {
    if (!this.enabled || !this.ctx) return
    try {
      if (this.ctx.state === 'suspended') this.ctx.resume()
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(587.33, this.ctx.currentTime)
      osc.frequency.setValueAtTime(880, this.ctx.currentTime + 0.05)
      gain.gain.setValueAtTime(0.035, this.ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.12)
      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start()
      osc.stop(this.ctx.currentTime + 0.12)
    } catch {
      // AudioContext policy catch
    }
  }
}

export const gameAudio = new GamifiedAudio()
