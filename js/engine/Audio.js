// Procedural audio using Web Audio API
// No external sound files needed - all sounds generated in code

let audioCtx = null;

function getCtx() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
}

// Ensure audio context is resumed (browsers require user gesture)
function ensureResumed() {
    const ctx = getCtx();
    if (ctx.state === 'suspended') {
        ctx.resume();
    }
    return ctx;
}

export class Audio {
    static enabled = true;

    static init() {
        // Resume on first user interaction
        const resume = () => {
            ensureResumed();
            document.removeEventListener('click', resume);
            document.removeEventListener('keydown', resume);
        };
        document.addEventListener('click', resume);
        document.addEventListener('keydown', resume);
    }

    // === SOUND EFFECTS ===

    // Bat crack - sharp attack, medium decay
    static batCrack(power = 0.5) {
        if (!Audio.enabled) return;
        const ctx = ensureResumed();
        const now = ctx.currentTime;

        // Noise burst for crack
        const bufferSize = ctx.sampleRate * 0.08;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3);
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        // Filter for wood character
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 800 + power * 1200;
        filter.Q.value = 2;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.6 + power * 0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(now);
        noise.stop(now + 0.15);

        // Tonal component
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400 + power * 300, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);

        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.3, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        osc.connect(oscGain);
        oscGain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
    }

    // Mitt pop - softer, lower
    static mittPop(quality = 0.5) {
        if (!Audio.enabled) return;
        const ctx = ensureResumed();
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200 + quality * 100, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.4 + quality * 0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);

        // Leather slap noise
        const bufferSize = ctx.sampleRate * 0.04;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 5);
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const nGain = ctx.createGain();
        nGain.gain.setValueAtTime(0.15, now);
        nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        const lpf = ctx.createBiquadFilter();
        lpf.type = 'lowpass';
        lpf.frequency.value = 600;

        noise.connect(lpf);
        lpf.connect(nGain);
        nGain.connect(ctx.destination);
        noise.start(now);
        noise.stop(now + 0.06);
    }

    // Swing whoosh
    static swingWhoosh() {
        if (!Audio.enabled) return;
        const ctx = ensureResumed();
        const now = ctx.currentTime;

        const bufferSize = ctx.sampleRate * 0.15;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            const t = i / bufferSize;
            data[i] = (Math.random() * 2 - 1) * Math.sin(t * Math.PI) * 0.3;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(200, now);
        filter.frequency.linearRampToValueAtTime(1500, now + 0.1);
        filter.Q.value = 1;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(now);
        noise.stop(now + 0.18);
    }

    // Crowd cheer
    static crowdCheer(intensity = 0.5) {
        if (!Audio.enabled) return;
        const ctx = ensureResumed();
        const now = ctx.currentTime;
        const duration = 0.8 + intensity * 1.2;

        const bufferSize = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            const t = i / bufferSize;
            const envelope = Math.sin(t * Math.PI) * (1 - t * 0.3);
            data[i] = (Math.random() * 2 - 1) * envelope;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1200;
        filter.Q.value = 0.5;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.15 * intensity, now);
        gain.gain.linearRampToValueAtTime(0.25 * intensity, now + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(now);
        noise.stop(now + duration);
    }

    // Strike call - umpire "hah!" approximation
    static strikeCall() {
        if (!Audio.enabled) return;
        const ctx = ensureResumed();
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.linearRampToValueAtTime(180, now + 0.15);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1000;

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
    }

    // UI click
    static uiClick() {
        if (!Audio.enabled) return;
        const ctx = ensureResumed();
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.06);
    }

    // Home run fanfare
    static homeRunFanfare() {
        if (!Audio.enabled) return;
        const ctx = ensureResumed();
        const now = ctx.currentTime;

        // Rising tone sequence
        const notes = [440, 554, 659, 880];
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            osc.type = 'square';
            osc.frequency.value = freq;

            const gain = ctx.createGain();
            const start = now + i * 0.12;
            gain.gain.setValueAtTime(0, start);
            gain.gain.linearRampToValueAtTime(0.12, start + 0.02);
            gain.gain.setValueAtTime(0.12, start + 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.15);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(start);
            osc.stop(start + 0.18);
        });

        // Crowd cheer after
        setTimeout(() => Audio.crowdCheer(1.0), 500);
    }

    // Out call
    static outCall() {
        if (!Audio.enabled) return;
        const ctx = ensureResumed();
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(350, now);
        osc.frequency.linearRampToValueAtTime(200, now + 0.2);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
    }
}
