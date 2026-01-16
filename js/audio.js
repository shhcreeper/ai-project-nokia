// Audio Management
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let currentMusic = null;
let musicVolume = 0.8;
let sfxVolume = 0.7;

// Sound effects using Web Audio API
const sounds = {
    perfect: null,
    great: null,
    good: null,
    miss: null
};

function initializeAudio() {
    // Create hit sounds
    sounds.perfect = createHitSound(800, 0.1);
    sounds.great = createHitSound(600, 0.1);
    sounds.good = createHitSound(400, 0.1);
    sounds.miss = createHitSound(200, 0.15);
}

function createHitSound(frequency, duration) {
    return { frequency, duration };
}

function playHitSound(type) {
    if (!sounds[type]) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = sounds[type].frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(sfxVolume * 0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sounds[type].duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + sounds[type].duration);
}

// Procedural music generation
function generateBeatPattern(bpm, duration) {
    const beatInterval = 60 / bpm;
    const beats = [];
    let time = 0;
    
    while (time < duration) {
        beats.push(time);
        time += beatInterval;
    }
    
    return beats;
}

function playNote(frequency, startTime, duration) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(musicVolume * 0.15, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
}

function playBeat(startTime) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(audioContext.destination);
    
    osc.frequency.value = 80;
    osc.type = 'triangle';
    
    gain.gain.setValueAtTime(musicVolume * 0.2, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);
    
    osc.start(startTime);
    osc.stop(startTime + 0.1);
}

function startBackgroundMusic(bpm) {
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    // Simple beat pattern
    const interval = 60 / bpm;
    let nextBeatTime = audioContext.currentTime;
    
    function scheduleBeat() {
        if (window.gameState && !window.gameState.isPlaying) return;
        if (window.gameState && window.gameState.isPaused) {
            setTimeout(scheduleBeat, 100);
            return;
        }
        
        while (nextBeatTime < audioContext.currentTime + 0.1) {
            playBeat(nextBeatTime);
            nextBeatTime += interval;
        }
        
        setTimeout(scheduleBeat, 50);
    }
    
    scheduleBeat();
}

function stopAllAudio() {
    // Audio context will handle cleanup
}

function pauseAudio() {
    audioContext.suspend();
}

function resumeAudio() {
    audioContext.resume();
}

function setMusicVolume(value) {
    musicVolume = value;
}

function setSFXVolume(value) {
    sfxVolume = value;
}
