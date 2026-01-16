// Audio Management System
let audioContext;
let musicGain;
let sfxGain;
let currentMusic;

// Initialize audio system
function initializeAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create gain nodes for volume control
        musicGain = audioContext.createGain();
        sfxGain = audioContext.createGain();
        
        musicGain.connect(audioContext.destination);
        sfxGain.connect(audioContext.destination);
        
        // Set initial volumes
        musicGain.gain.value = gameSettings.musicVolume || 0.8;
        sfxGain.gain.value = gameSettings.sfxVolume || 0.7;
    } catch (e) {
        console.log('Audio not supported in this browser', e);
    }
}

// Play background music (placeholder - using Web Audio API oscillator for demo)
function playMusic(songId) {
    if (!audioContext) return;
    
    stopAllAudio();
    
    // Create a simple placeholder tone
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = 440; // A4 note
    oscillator.connect(musicGain);
    oscillator.start();
    
    currentMusic = oscillator;
}

// Play sound effect
function playSFX(type) {
    if (!audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Different sounds for different actions
    switch(type) {
        case 'perfect':
            oscillator.frequency.value = 880; // A5
            break;
        case 'great':
            oscillator.frequency.value = 660; // E5
            break;
        case 'good':
            oscillator.frequency.value = 523; // C5
            break;
        default:
            oscillator.frequency.value = 440;
    }
    
    oscillator.connect(gainNode);
    gainNode.connect(sfxGain);
    
    // Quick beep
    gainNode.gain.value = 0.3;
    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    oscillator.stop(audioContext.currentTime + 0.1);
}

// Stop all audio
function stopAllAudio() {
    if (currentMusic) {
        try {
            currentMusic.stop();
        } catch (e) {
            // Already stopped
        }
        currentMusic = null;
    }
}

// Pause audio
function pauseAudio() {
    if (audioContext && audioContext.state === 'running') {
        audioContext.suspend();
    }
}

// Resume audio
function resumeAudio() {
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

// Set music volume
function setMusicVolume(volume) {
    if (musicGain) {
        musicGain.gain.value = volume;
    }
}

// Set SFX volume
function setSFXVolume(volume) {
    if (sfxGain) {
        sfxGain.gain.value = volume;
    }
}
