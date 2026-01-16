// Game State Management
let currentSong = null;
let currentDifficulty = 'normal';
let gameSettings = {
    noteSpeed: 5,
    musicVolume: 0.8,
    sfxVolume: 0.7
};

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    loadHighScores();
    initializeAudio();
});

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function showMainMenu() {
    showScreen('main-menu');
    stopAllAudio();
}

function showSongSelect() {
    showScreen('song-select');
}

function showStory() {
    showScreen('story-screen');
    startDialogue();
}

function showSettings() {
    showScreen('settings-screen');
}

function selectSong(songId) {
    currentSong = songId;
    // Highlight selected song
    document.querySelectorAll('.song-card').forEach(card => {
        card.style.borderColor = 'transparent';
    });
    event.target.closest('.song-card').style.borderColor = '#667eea';
    event.target.closest('.song-card').style.borderWidth = '4px';
    
    // Auto-start after selection
    setTimeout(() => {
        startGame();
    }, 500);
}

function setDifficulty(diff) {
    currentDifficulty = diff;
    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

function startGame() {
    if (!currentSong) {
        alert('Please select a song first!');
        return;
    }
    showScreen('game-screen');
    initRhythmGame(currentSong, currentDifficulty);
}

function pauseGame() {
    // Implement pause functionality
    if (window.gameState && window.gameState.isPlaying) {
        window.gameState.isPaused = !window.gameState.isPaused;
        if (window.gameState.isPaused) {
            pauseAudio();
        } else {
            resumeAudio();
        }
    }
}

function showResults(results) {
    showScreen('results-screen');
    
    // Calculate grade
    const accuracy = results.accuracy;
    let grade = 'D';
    if (accuracy >= 95) grade = 'S';
    else if (accuracy >= 90) grade = 'A';
    else if (accuracy >= 80) grade = 'B';
    else if (accuracy >= 70) grade = 'C';
    
    // Display results
    document.getElementById('grade').textContent = grade;
    document.getElementById('final-score').textContent = results.score.toLocaleString();
    document.getElementById('max-combo').textContent = results.maxCombo;
    document.getElementById('accuracy').textContent = accuracy.toFixed(2) + '%';
    document.getElementById('perfect-count').textContent = results.perfect;
    document.getElementById('great-count').textContent = results.great;
    document.getElementById('good-count').textContent = results.good;
    document.getElementById('miss-count').textContent = results.miss;
    
    // Save high score
    saveHighScore(currentSong, currentDifficulty, results.score);
}

function updateSpeed(value) {
    gameSettings.noteSpeed = parseInt(value);
    document.getElementById('speed-value').textContent = value;
}

function updateMusicVolume(value) {
    gameSettings.musicVolume = value / 100;
    document.getElementById('music-volume-value').textContent = value;
    setMusicVolume(gameSettings.musicVolume);
}

function updateSFXVolume(value) {
    gameSettings.sfxVolume = value / 100;
    document.getElementById('sfx-volume-value').textContent = value;
    setSFXVolume(gameSettings.sfxVolume);
}

// High Score Management
function loadHighScores() {
    const scores = localStorage.getItem('rhythmGameHighScores');
    return scores ? JSON.parse(scores) : {};
}

function saveHighScore(song, difficulty, score) {
    const highScores = loadHighScores();
    const key = `${song}_${difficulty}`;
    
    if (!highScores[key] || score > highScores[key]) {
        highScores[key] = score;
        localStorage.setItem('rhythmGameHighScores', JSON.stringify(highScores));
    }
}