// Rhythm Game Core
let canvas, ctx;
let gameState = {
    isPlaying: false,
    isPaused: false,
    score: 0,
    combo: 0,
    maxCombo: 0,
    notes: [],
    hitCounts: {
        perfect: 0,
        great: 0,
        good: 0,
        miss: 0
    },
    startTime: 0,
    currentTime: 0
};

// Game Configuration
const LANES = 4; // Number of note lanes (D, F, J, K keys)
const LANE_KEYS = ['d', 'f', 'j', 'k'];
const NOTE_SIZE = 60;
const TARGET_Y = 550; // Y position of target zones
const JUDGMENT_THRESHOLDS = {
    perfect: 50,  // pixels
    great: 100,
    good: 150
};

// Note class
class Note {
    constructor(lane, time) {
        this.lane = lane;
        this.time = time; // When to hit (in milliseconds)
        this.y = -NOTE_SIZE;
        this.hit = false;
        this.missed = false;
    }
    
    update(currentTime, noteSpeed) {
        // Calculate note position based on time
        const timeDiff = this.time - currentTime;
        const speed = noteSpeed * 0.5; // Adjust speed factor
        this.y = TARGET_Y - (timeDiff * speed);
        
        // Mark as missed if it goes past the target
        if (this.y > TARGET_Y + JUDGMENT_THRESHOLDS.good && !this.hit && !this.missed) {
            this.missed = true;
            gameState.combo = 0;
            gameState.hitCounts.miss++;
        }
    }
    
    draw(ctx, laneWidth) {
        if (this.hit || this.missed) return;
        
        const x = this.lane * laneWidth + (laneWidth - NOTE_SIZE) / 2;
        
        // Draw note with gradient
        const gradient = ctx.createRadialGradient(
            x + NOTE_SIZE/2, this.y + NOTE_SIZE/2, 5,
            x + NOTE_SIZE/2, this.y + NOTE_SIZE/2, NOTE_SIZE/2
        );
        gradient.addColorStop(0, '#ff6b9d');
        gradient.addColorStop(0.5, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x + NOTE_SIZE/2, this.y + NOTE_SIZE/2, NOTE_SIZE/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw note border
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.stroke();
    }
    
    checkHit(currentTime) {
        const distance = Math.abs(this.y - TARGET_Y);
        
        if (distance <= JUDGMENT_THRESHOLDS.perfect) {
            return 'perfect';
        } else if (distance <= JUDGMENT_THRESHOLDS.great) {
            return 'great';
        } else if (distance <= JUDGMENT_THRESHOLDS.good) {
            return 'good';
        }
        return null;
    }
}

// Initialize rhythm game
function initRhythmGame(songId, difficulty) {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Reset game state
    gameState = {
        isPlaying: true,
        isPaused: false,
        score: 0,
        combo: 0,
        maxCombo: 0,
        notes: [],
        hitCounts: {
            perfect: 0,
            great: 0,
            good: 0,
            miss: 0
        },
        startTime: Date.now(),
        currentTime: 0
    };
    
    // Generate notes for the song
    generateNotes(songId, difficulty);
    
    // Update UI
    updateScoreDisplay();
    
    // Set up keyboard controls
    setupControls();
    
    // Start game loop
    gameLoop();
}

// Generate notes based on song and difficulty
function generateNotes(songId, difficulty) {
    const notePatterns = {
        song1: { bpm: 135, duration: 105 }, // 1:45 in seconds
        song2: { bpm: 140, duration: 110 },
        song3: { bpm: 150, duration: 120 }
    };
    
    const pattern = notePatterns[songId] || notePatterns.song1;
    const beatInterval = (60 / pattern.bpm) * 1000; // ms per beat
    
    // Difficulty modifiers
    const noteDensity = {
        easy: 1,    // Every beat
        normal: 2,  // Every half beat
        hard: 4     // Every quarter beat
    };
    
    const density = noteDensity[difficulty] || noteDensity.normal;
    const noteInterval = beatInterval / density;
    
    // Generate notes
    for (let time = 2000; time < pattern.duration * 1000; time += noteInterval) {
        const lane = Math.floor(Math.random() * LANES);
        gameState.notes.push(new Note(lane, time));
    }
}

// Setup keyboard controls
function setupControls() {
    document.addEventListener('keydown', handleKeyPress);
}

function handleKeyPress(e) {
    if (!gameState.isPlaying || gameState.isPaused) return;
    
    const key = e.key.toLowerCase();
    const laneIndex = LANE_KEYS.indexOf(key);
    
    if (laneIndex === -1) return;
    
    // Find closest note in the lane
    const notesInLane = gameState.notes.filter(
        note => note.lane === laneIndex && !note.hit && !note.missed
    );
    
    if (notesInLane.length === 0) return;
    
    // Find the closest note to the target
    let closestNote = notesInLane[0];
    let minDistance = Math.abs(closestNote.y - TARGET_Y);
    
    for (const note of notesInLane) {
        const distance = Math.abs(note.y - TARGET_Y);
        if (distance < minDistance) {
            minDistance = distance;
            closestNote = note;
        }
    }
    
    // Check if within hitting range
    const judgment = closestNote.checkHit(gameState.currentTime);
    
    if (judgment) {
        closestNote.hit = true;
        processHit(judgment);
        showJudgment(judgment);
        
        // Audio feedback
        if (typeof playSFX === 'function') {
            playSFX(judgment);
        }
        
        // Visual feedback - flash the lane
        flashLane(laneIndex);
    }
}

// Process hit and update score
function processHit(judgment) {
    const scores = {
        perfect: 300,
        great: 200,
        good: 100
    };
    
    gameState.combo++;
    gameState.maxCombo = Math.max(gameState.maxCombo, gameState.combo);
    gameState.hitCounts[judgment]++;
    
    const baseScore = scores[judgment] || 0;
    const comboBonus = Math.floor(gameState.combo / 10) * 50;
    gameState.score += baseScore + comboBonus;
    
    updateScoreDisplay();
}

// Show judgment feedback
function showJudgment(judgment) {
    const judgmentEl = document.getElementById('judgment');
    const judgmentText = {
        perfect: 'PERFECT',
        great: 'GREAT',
        good: 'GOOD'
    };
    
    const judgmentColor = {
        perfect: '#FFD700',
        great: '#00FF00',
        good: '#FFA500'
    };
    
    judgmentEl.textContent = judgmentText[judgment] || '';
    judgmentEl.style.color = judgmentColor[judgment] || 'white';
    judgmentEl.classList.remove('show');
    
    // Trigger animation
    setTimeout(() => {
        judgmentEl.classList.add('show');
    }, 10);
}

// Flash lane on hit
function flashLane(laneIndex) {
    // This will be drawn in the game loop
    if (!gameState.laneFlashes) {
        gameState.laneFlashes = [];
    }
    gameState.laneFlashes[laneIndex] = Date.now();
}

// Update score display
function updateScoreDisplay() {
    document.getElementById('score').textContent = gameState.score.toLocaleString();
    document.getElementById('combo').textContent = gameState.combo;
}

// Main game loop
function gameLoop() {
    if (!gameState.isPlaying) return;
    
    if (!gameState.isPaused) {
        gameState.currentTime = Date.now() - gameState.startTime;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw lanes
        drawLanes();
        
        // Draw target zones
        drawTargetZones();
        
        // Update and draw notes
        const laneWidth = canvas.width / LANES;
        const noteSpeed = (typeof gameSettings !== 'undefined' && gameSettings.noteSpeed) ? gameSettings.noteSpeed : 5;
        
        for (const note of gameState.notes) {
            note.update(gameState.currentTime, noteSpeed);
            note.draw(ctx, laneWidth);
        }
        
        // Draw lane flashes
        drawLaneFlashes();
        
        // Check if game is over
        if (checkGameEnd()) {
            endGame();
            return;
        }
    }
    
    requestAnimationFrame(gameLoop);
}

// Draw lane separators
function drawLanes() {
    const laneWidth = canvas.width / LANES;
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    
    for (let i = 1; i < LANES; i++) {
        const x = i * laneWidth;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
}

// Draw target zones at bottom
function drawTargetZones() {
    const laneWidth = canvas.width / LANES;
    
    for (let i = 0; i < LANES; i++) {
        const x = i * laneWidth + (laneWidth - NOTE_SIZE) / 2;
        
        // Draw target zone
        ctx.strokeStyle = 'rgba(255, 107, 157, 0.6)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(x + NOTE_SIZE/2, TARGET_Y + NOTE_SIZE/2, NOTE_SIZE/2 + 5, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw key label
        ctx.fillStyle = 'white';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(LANE_KEYS[i].toUpperCase(), x + NOTE_SIZE/2, TARGET_Y + NOTE_SIZE/2);
    }
}

// Draw lane flash effects
function drawLaneFlashes() {
    if (!gameState.laneFlashes) return;
    
    const laneWidth = canvas.width / LANES;
    const now = Date.now();
    const flashDuration = 200; // ms
    
    for (let i = 0; i < LANES; i++) {
        if (gameState.laneFlashes[i]) {
            const elapsed = now - gameState.laneFlashes[i];
            if (elapsed < flashDuration) {
                const alpha = 1 - (elapsed / flashDuration);
                const x = i * laneWidth;
                
                ctx.fillStyle = `rgba(255, 107, 157, ${alpha * 0.3})`;
                ctx.fillRect(x, 0, laneWidth, canvas.height);
            }
        }
    }
}

// Check if game has ended
function checkGameEnd() {
    // Game ends when all notes have been processed
    const allNotesProcessed = gameState.notes.every(note => note.hit || note.missed);
    const lastNoteTime = gameState.notes.length > 0 
        ? gameState.notes[gameState.notes.length - 1].time 
        : 0;
    
    return allNotesProcessed && gameState.currentTime > lastNoteTime + 2000;
}

// End game and show results
function endGame() {
    gameState.isPlaying = false;
    document.removeEventListener('keydown', handleKeyPress);
    
    // Calculate accuracy
    const totalNotes = gameState.notes.length;
    const hitNotes = gameState.hitCounts.perfect + gameState.hitCounts.great + gameState.hitCounts.good;
    const accuracy = totalNotes > 0 ? (hitNotes / totalNotes) * 100 : 0;
    
    // Show results (check if function exists)
    if (typeof showResults === 'function') {
        showResults({
            score: gameState.score,
            maxCombo: gameState.maxCombo,
            accuracy: accuracy,
            perfect: gameState.hitCounts.perfect,
            great: gameState.hitCounts.great,
            good: gameState.hitCounts.good,
            miss: gameState.hitCounts.miss
        });
    }
}

// Make gameState available globally for pause functionality
window.gameState = gameState;
