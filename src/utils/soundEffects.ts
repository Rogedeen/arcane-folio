/**
 * Web Audio API ile tamamen yerel ve bağımlılıksız sentetik zar sesleri ve fanfar
 */

class SoundController {
  private ctx: AudioContext | null = null;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Zarların tepsiye çarpıp takla atma sesi (tumble clatter)
   */
  playDiceRollSound() {
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // 4-6 kısa çarpmalı tıkırtı
      const clicks = 5;
      for (let i = 0; i < clicks; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const hitTime = now + i * 0.07 + Math.random() * 0.03;
        const freq = 180 + Math.random() * 220;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, hitTime);
        osc.frequency.exponentialRampToValueAtTime(80, hitTime + 0.06);

        gain.gain.setValueAtTime(0.35 / (i + 1), hitTime);
        gain.gain.exponentialRampToValueAtTime(0.001, hitTime + 0.06);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(hitTime);
        osc.stop(hitTime + 0.07);
      }
    } catch {
      // Ses engellendiyse sessizce devam et
    }
  }

  /**
   * Kritik 20 atıldığında çalan mistik altın çan / fanfar sesi
   */
  playCritSound() {
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpej

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = now + idx * 0.08;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.8);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.85);
      });
    } catch {
      // sessizce geç
    }
  }
}

export const soundEffects = new SoundController();
