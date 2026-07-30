function createAudioContext() {
  try {
    return new (window.AudioContext || (window as any).webkitAudioContext)();
  } catch (e) {
    return null;
  }
}

export function unlockAudio() {
  try {
    const ctx = createAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    setTimeout(() => ctx.close(), 500);
  } catch (e) {
    // ignore
  }
}

// Shared short open/close tones using Web Audio API
export function playOpenTone() {
  try {
    const ctx = createAudioContext();
    if (!ctx) return;

    const schedule = () => {
      const now = ctx.currentTime;
      const playTone = (freq: number, duration: number, gain: number, delay = 0) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + delay);
        gainNode.gain.setValueAtTime(0.0001, now + delay);
        gainNode.gain.exponentialRampToValueAtTime(gain, now + delay + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + delay + duration);
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + duration);
      };

      playTone(860, 0.14, 0.05, 0);
      playTone(1180, 0.14, 0.05, 0.07);
      setTimeout(() => ctx.close(), 700);
    };

    if (ctx.state === "suspended") {
      ctx.resume().then(schedule).catch(() => {});
    } else {
      schedule();
    }
  } catch (e) {
    // ignore
  }
}

let supportAlertToneState:
  | {
      ctx: AudioContext;
      carrier: OscillatorNode;
      lfo: OscillatorNode;
    }
  | null = null;

export function playCloseTone() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = 410;
    g.gain.value = 0.0001;
    o.connect(g);
    g.connect(ctx.destination);
    const now = ctx.currentTime;
    g.gain.linearRampToValueAtTime(0.04, now + 0.01);
    o.start(now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    o.stop(now + 0.24);
    setTimeout(() => ctx.close(), 500);
  } catch (e) {
    // ignore
  }
}

export function startSupportAlertTone() {
  if (supportAlertToneState) return;

  try {
    const ctx = createAudioContext();
    if (!ctx) return;

    const start = () => {
      const carrier = ctx.createOscillator();
      const carrierGain = ctx.createGain();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();

      carrier.type = "triangle";
      carrier.frequency.value = 520;
      carrierGain.gain.value = 0.04;

      lfo.type = "sine";
      lfo.frequency.value = 2.2;
      lfoGain.gain.value = 0.015;

      carrier.connect(carrierGain);
      carrierGain.connect(ctx.destination);

      lfo.connect(lfoGain);
      lfoGain.connect(carrierGain.gain);

      carrier.start();
      lfo.start();

      supportAlertToneState = { ctx, carrier, lfo };
    };

    if (ctx.state === "suspended") {
      ctx.resume().then(start).catch(() => {});
    } else {
      start();
    }
  } catch (e) {
    // ignore
  }
}

export function stopSupportAlertTone() {
  if (!supportAlertToneState) return;

  try {
    supportAlertToneState.carrier.stop();
    supportAlertToneState.lfo.stop();
    supportAlertToneState.ctx.close();
  } catch (e) {
    // ignore
  } finally {
    supportAlertToneState = null;
  }
}

let supportAlertSpeechTimer: number | null = null;

function speakSupportAlertMessage() {
  try {
    const synth = window.speechSynthesis;
    if (!synth) return;

    const message =
      "Hello SchoolBase. You have a new support ticket. Please attend to it now.";
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = "en-US";
    utterance.volume = 1;
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    synth.cancel();
    synth.speak(utterance);
  } catch (e) {
    // ignore if speech synthesis is unavailable or blocked
  }
}

export function announceSupportAlert() {
  try {
    const synth = window.speechSynthesis;
    if (!synth) return;

    stopSupportAlertSpeech();
    speakSupportAlertMessage();

    supportAlertSpeechTimer = window.setInterval(() => {
      if (!synth.speaking) {
        speakSupportAlertMessage();
      }
    }, 12000);
  } catch (e) {
    // ignore if speech synthesis is unavailable or blocked
  }
}

export function stopSupportAlertSpeech() {
  try {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
  } catch (e) {
    // ignore
  } finally {
    if (supportAlertSpeechTimer !== null) {
      window.clearInterval(supportAlertSpeechTimer);
      supportAlertSpeechTimer = null;
    }
  }
}
