export class GameAudio {
  private context: AudioContext | null = null;
  private engine: OscillatorNode | null = null;
  private overtone: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private enabled = true;
  private moving = false;
  private direction: -1 | 1 = 1;

  async start(): Promise<void> {
    if (typeof window === 'undefined' || !window.AudioContext) return;
    if (!this.context) {
      this.context = new AudioContext();

      const filter = this.context.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 220;

      this.engineGain = this.context.createGain();
      this.engineGain.gain.value = 0;
      this.engine = this.context.createOscillator();
      this.engine.type = 'sawtooth';
      this.engine.frequency.value = 48;

      const overtoneGain = this.context.createGain();
      overtoneGain.gain.value = 0.22;
      this.overtone = this.context.createOscillator();
      this.overtone.type = 'triangle';
      this.overtone.frequency.value = 96;

      this.engine.connect(filter);
      this.overtone.connect(overtoneGain);
      overtoneGain.connect(filter);
      filter.connect(this.engineGain);
      this.engineGain.connect(this.context.destination);
      this.engine.start();
      this.overtone.start();
    }

    if (this.context.state === 'suspended') {
      await this.context.resume();
    }
    this.applyEngineState();
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.applyEngineState();
  }

  setMotion(moving: boolean, direction: -1 | 1): void {
    if (this.moving === moving && this.direction === direction) return;
    this.moving = moving;
    this.direction = direction;
    this.applyEngineState();
  }

  speakPolish(text: string, pitch = 1.24, rate = 0.96): void {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pl-PL';
    utterance.pitch = pitch;
    utterance.rate = rate;
    utterance.volume = 0.9;

    const polishVoice = window.speechSynthesis
      .getVoices()
      .find((voice) => voice.lang.toLowerCase().startsWith('pl'));
    if (polishVoice) utterance.voice = polishVoice;

    window.speechSynthesis.speak(utterance);
  }

  stopSpeech(): void {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  dispose(): void {
    this.stopSpeech();
    this.engine?.stop();
    this.overtone?.stop();
    void this.context?.close();
    this.context = null;
    this.engine = null;
    this.overtone = null;
    this.engineGain = null;
  }

  private applyEngineState(): void {
    if (!this.context || !this.engine || !this.overtone || !this.engineGain) {
      return;
    }

    const now = this.context.currentTime;
    const audible = this.enabled && this.moving;
    const targetGain = audible ? 0.035 : 0;
    const baseFrequency = audible ? (this.direction === 1 ? 66 : 58) : 42;

    this.engineGain.gain.setTargetAtTime(targetGain, now, 0.11);
    this.engine.frequency.setTargetAtTime(baseFrequency, now, 0.12);
    this.overtone.frequency.setTargetAtTime(baseFrequency * 2.15, now, 0.12);
  }
}
