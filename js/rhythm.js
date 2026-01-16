// Rhythm Game Engine - Project Sekai Style

// Game state
window.gameState = {
    isPlaying: false,
    isPaused: false,
    score: 0,
    combo: 0,
    maxCombo: 0,
    life: 1000,
    maxLife: 1000,
    perfect: 0,
    great: 0,
    good: 0,
    miss: 0,
    startTime: 0,
    songDuration: 0
};

// Game configuration
const config = {
    lanes: 6,
    noteSpeed: 5,
    hitLineY: 0.85, // Position of hit line (percentage from top)
    spawnY: 0,
    judgeWindows: {
        perfect: 50,  // ms
        great: 100,
        good: 150
    },
    scoreValues: {
        perfect: 1000,
        great: 700,
        good: 400
    }
};

// Notes array
let notes = [];
let activeNotes = [];
let particles = [];
let dancingCharacters = [];

// Canvas and context
let canvas, ctx;
let gameLoopId;

// Lane key bindings
const laneKeys = ['s', 'd', 'f', 'j', 'k', 'l'];

// Initialize the rhythm game
function initRhythmGame(songId, difficulty) {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Reset game state
    window.gameState = {
        isPlaying: true,
        isPaused: false,
        score: 0,
        combo: 0,
        maxCombo: 0,
        life: 1000,
        maxLife: 1000,
        perfect: 0,
        great: 0,
        good: 0,
        miss: 0,
        startTime: Date.now(),
        songDuration: getSongDuration(songId)
    };
    
    // Generate notes based on song and difficulty
    notes = generateNotes(songId, difficulty);
    activeNotes = [];
    particles = [];
    
    // Initialize dancing characters
    initDancingCharacters();
    
    // Set up input handlers
    setupInputHandlers();
    
    // Start background music
    startBackgroundMusic(getSongBPM(songId));
    
    // Start game loop
    gameLoop();
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function getSongDuration(songId) {
    const durations = {
        'song1': 105000, // 1:45
        'song2': 110000, // 1:50
        'song3': 120000  // 2:00
    };
    return durations[songId] || 60000;
}

function getSongBPM(songId) {
    const bpms = {
        'song1': 135,
        'song2': 140,
        'song3': 150
    };
    return bpms[songId] || 140;
}

// Generate notes for the song
function generateNotes(songId, difficulty) {
    const notes = [];
    const duration = getSongDuration(songId);
    const bpm = getSongBPM(songId);
    const beatInterval = 60000 / bpm;
    
    // Difficulty settings
    const difficultySettings = {
        easy: { density: 0.3, doubleChance: 0.1 },
        normal: { density: 0.5, doubleChance: 0.2 },
        hard: { density: 0.8, doubleChance: 0.4 }
    };
    
    const settings = difficultySettings[difficulty] || difficultySettings.normal;
    
    let time = 2000; // Start after 2 seconds
    while (time < duration - 3000) {
        if (Math.random() < settings.density) {
            const lane = Math.floor(Math.random() * config.lanes);
            notes.push({
                time: time,
                lane: lane,
                hit: false,
                missed: false
            });
            
            // Chance for double note
            if (Math.random() < settings.doubleChance) {
                let secondLane = Math.floor(Math.random() * config.lanes);
                while (secondLane === lane) {
                    secondLane = Math.floor(Math.random() * config.lanes);
                }
                notes.push({
                    time: time,
                    lane: secondLane,
                    hit: false,
                    missed: false
                });
            }
        }
        time += beatInterval / 2;
    }
    
    return notes.sort((a, b) => a.time - b.time);
}

// Initialize dancing characters for background
function initDancingCharacters() {
    dancingCharacters = [
        { character: 'rui', x: 0.12, y: 0.3, scale: 6, frame: 0 },
        { character: 'tsukasa', x: 0.88, y: 0.3, scale: 6, frame: 4 }
    ];
}

// Setup keyboard input
function setupInputHandlers() {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Touch/click support for lanes
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('touchstart', handleTouch, { passive: false });
}

function cleanupInputHandlers() {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
    canvas.removeEventListener('click', handleCanvasClick);
    canvas.removeEventListener('touchstart', handleTouch);
}

function handleKeyDown(e) {
    if (gameState.isPaused || !gameState.isPlaying) return;
    
    const lane = laneKeys.indexOf(e.key.toLowerCase());
    if (lane !== -1) {
        e.preventDefault();
        hitLane(lane);
    }
}

function handleKeyUp(e) {
    // Could be used for hold notes in future
}

function handleCanvasClick(e) {
    if (gameState.isPaused || !gameState.isPlaying) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const laneWidth = canvas.width / config.lanes;
    const lane = Math.floor(x / laneWidth);
    
    if (lane >= 0 && lane < config.lanes) {
        hitLane(lane);
    }
}

function handleTouch(e) {
    e.preventDefault();
    if (gameState.isPaused || !gameState.isPlaying) return;
    
    for (let touch of e.touches) {
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const laneWidth = canvas.width / config.lanes;
        const lane = Math.floor(x / laneWidth);
        
        if (lane >= 0 && lane < config.lanes) {
            hitLane(lane);
        }
    }
}

// Hit detection for a lane
function hitLane(lane) {
    const currentTime = Date.now() - gameState.startTime;
    const hitLineTime = currentTime;
    
    // Find closest note in this lane
    let closestNote = null;
    let closestDiff = Infinity;
    
    for (let note of notes) {
        if (note.lane === lane && !note.hit && !note.missed) {
            const diff = Math.abs(note.time - hitLineTime);
            if (diff < closestDiff && diff < config.judgeWindows.good + 100) {
                closestDiff = diff;
                closestNote = note;
            }
        }
    }
    
    if (closestNote) {
        closestNote.hit = true;
        
        let judgment, score;
        if (closestDiff <= config.judgeWindows.perfect) {
            judgment = 'PERFECT';
            score = config.scoreValues.perfect;
            gameState.perfect++;
            playHitSound('perfect');
        } else if (closestDiff <= config.judgeWindows.great) {
            judgment = 'GREAT';
            score = config.scoreValues.great;
            gameState.great++;
            playHitSound('great');
        } else if (closestDiff <= config.judgeWindows.good) {
            judgment = 'GOOD';
            score = config.scoreValues.good;
            gameState.good++;
            playHitSound('good');
        } else {
            return; // Too early or late
        }
        
        gameState.combo++;
        if (gameState.combo > gameState.maxCombo) {
            gameState.maxCombo = gameState.combo;
        }
        
        // Combo bonus
        const comboBonus = Math.floor(gameState.combo / 10) * 50;
        gameState.score += score + comboBonus;
        
        // Show judgment
        showJudgment(judgment);
        
        // Create particles
        createHitParticles(lane, judgment);
        
        // Heal life on good hits
        gameState.life = Math.min(gameState.maxLife, gameState.life + 10);
        
    } else {
        // Missed (hit when no note)
        createLaneFlash(lane, '#ff4444');
    }
    
    updateUI();
}

// Miss a note
function missNote(note) {
    note.missed = true;
    gameState.miss++;
    gameState.combo = 0;
    gameState.life = Math.max(0, gameState.life - 50);
    
    showJudgment('MISS');
    playHitSound('miss');
    
    if (gameState.life <= 0) {
        endGame();
    }
    
    updateUI();
}

// Show judgment text
function showJudgment(text) {
    const judgment = document.getElementById('judgment');
    judgment.textContent = text;
    judgment.className = 'judgment ' + text.toLowerCase() + ' show';
    
    setTimeout(() => {
        judgment.classList.remove('show');
    }, 500);
}

// Create hit particles
function createHitParticles(lane, judgment) {
    const laneWidth = canvas.width / config.lanes;
    const x = lane * laneWidth + laneWidth / 2;
    const y = canvas.height * config.hitLineY;
    
    const colors = {
        'PERFECT': ['#00ffff', '#80ffff', '#ffffff'],
        'GREAT': ['#80ff80', '#c0ffc0', '#ffffff'],
        'GOOD': ['#ffff00', '#ffffaa', '#ffffff'],
        'MISS': ['#ff4444', '#ff8888', '#ffaaaa']
    };
    
    for (let i = 0; i < 15; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10 - 5,
            size: Math.random() * 8 + 4,
            color: colors[judgment][Math.floor(Math.random() * colors[judgment].length)],
            alpha: 1,
            life: 1
        });
    }
}

// Create lane flash effect
function createLaneFlash(lane, color) {
    const laneWidth = canvas.width / config.lanes;
    const x = lane * laneWidth;
    
    particles.push({
        type: 'flash',
        x: x,
        width: laneWidth,
        color: color,
        alpha: 0.5,
        life: 1
    });
}

// Update UI elements
function updateUI() {
    document.getElementById('score').textContent = gameState.score.toString().padStart(8, '0');
    document.getElementById('combo').textContent = gameState.combo;
    document.getElementById('life-value').textContent = gameState.life;
    document.getElementById('life-fill').style.width = (gameState.life / gameState.maxLife * 100) + '%';
    
    // Update grade
    const totalNotes = gameState.perfect + gameState.great + gameState.good + gameState.miss;
    const accuracy = totalNotes > 0 ? 
        (gameState.perfect * 100 + gameState.great * 70 + gameState.good * 40) / totalNotes : 0;
    
    let grade = 'C';
    if (accuracy >= 95) grade = 'S';
    else if (accuracy >= 85) grade = 'A';
    else if (accuracy >= 70) grade = 'B';
    
    document.getElementById('current-grade').textContent = grade;
    
    // Update progress
    const elapsed = Date.now() - gameState.startTime;
    const progress = Math.min(100, elapsed / gameState.songDuration * 100);
    document.getElementById('progress-fill').style.width = progress + '%';
    
    // Update score add
    const lastAdd = gameState.combo > 0 ? '+' + Math.floor(gameState.combo / 10) * 50 : '';
    document.getElementById('score-add').textContent = lastAdd;
}

// Main game loop
function gameLoop() {
    if (!gameState.isPlaying) return;
    
    if (!gameState.isPaused) {
        update();
        render();
    }
    
    gameLoopId = requestAnimationFrame(gameLoop);
}

// Update game state
function update() {
    const currentTime = Date.now() - gameState.startTime;
    
    // Check for song end
    if (currentTime >= gameState.songDuration) {
        endGame();
        return;
    }
    
    // Check for missed notes
    for (let note of notes) {
        if (!note.hit && !note.missed) {
            const noteScreenTime = note.time - currentTime;
            if (noteScreenTime < -200) { // Missed window
                missNote(note);
            }
        }
    }
    
    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= 0.02;
        p.alpha = p.life;
        
        if (p.type !== 'flash') {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.3; // gravity
        }
        
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
    
    // Update dancing characters
    for (let char of dancingCharacters) {
        char.frame += 0.15;
    }
}

// Render the game
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background gradient
    drawBackground();
    
    // Draw dancing pixel characters in background
    drawDancingCharacters();
    
    // Draw lane highway with 3D perspective
    drawLanes();
    
    // Draw notes
    drawNotes();
    
    // Draw hit line
    drawHitLine();
    
    // Draw particles
    drawParticles();
    
    // Draw lane key hints
    drawKeyHints();
}

// Draw background
function drawBackground() {
    // Dark purple gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a0030');
    gradient.addColorStop(0.5, '#0a0020');
    gradient.addColorStop(1, '#050010');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add scanlines effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    for (let y = 0; y < canvas.height; y += 4) {
        ctx.fillRect(0, y, canvas.width, 2);
    }
    
    // Add subtle glow in center
    const centerGlow = ctx.createRadialGradient(
        canvas.width / 2, canvas.height * 0.6, 0,
        canvas.width / 2, canvas.height * 0.6, canvas.width * 0.4
    );
    centerGlow.addColorStop(0, 'rgba(100, 50, 150, 0.2)');
    centerGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = centerGlow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Draw dancing pixel characters
function drawDancingCharacters() {
    for (let char of dancingCharacters) {
        const x = canvas.width * char.x;
        const y = canvas.height * char.y;
        
        // Draw glow behind character
        const glowGradient = ctx.createRadialGradient(x, y + 50, 0, x, y + 50, 100);
        glowGradient.addColorStop(0, 'rgba(180, 100, 255, 0.3)');
        glowGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGradient;
        ctx.fillRect(x - 100, y - 50, 200, 200);
        
        // Draw pixel character
        if (typeof drawPixelCharacter === 'function') {
            drawPixelCharacter(ctx, char.character, x - 48, y, char.scale, Math.floor(char.frame));
        }
    }
}

// Draw lanes with 3D perspective
function drawLanes() {
    const laneWidth = canvas.width / config.lanes;
    const hitY = canvas.height * config.hitLineY;
    const topY = canvas.height * 0.15;
    const perspectiveFactor = 0.4; // How much lanes narrow at top
    
    // Draw lane backgrounds
    for (let i = 0; i < config.lanes; i++) {
        const leftBottom = i * laneWidth;
        const rightBottom = (i + 1) * laneWidth;
        
        // Perspective - lanes are narrower at top
        const centerX = canvas.width / 2;
        const leftTop = centerX + (leftBottom - centerX) * perspectiveFactor;
        const rightTop = centerX + (rightBottom - centerX) * perspectiveFactor;
        
        // Lane background gradient
        const laneGradient = ctx.createLinearGradient(0, topY, 0, hitY);
        laneGradient.addColorStop(0, 'rgba(100, 50, 150, 0.1)');
        laneGradient.addColorStop(1, 'rgba(100, 50, 150, 0.3)');
        
        ctx.beginPath();
        ctx.moveTo(leftTop, topY);
        ctx.lineTo(rightTop, topY);
        ctx.lineTo(rightBottom, hitY + 50);
        ctx.lineTo(leftBottom, hitY + 50);
        ctx.closePath();
        ctx.fillStyle = laneGradient;
        ctx.fill();
        
        // Lane dividers
        ctx.beginPath();
        ctx.moveTo(leftTop, topY);
        ctx.lineTo(leftBottom, hitY + 50);
        ctx.strokeStyle = 'rgba(180, 100, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    // Draw rightmost divider
    const rightTop = canvas.width / 2 + (canvas.width - canvas.width / 2) * perspectiveFactor;
    ctx.beginPath();
    ctx.moveTo(rightTop, topY);
    ctx.lineTo(canvas.width, hitY + 50);
    ctx.stroke();
}

// Draw notes
function drawNotes() {
    const currentTime = Date.now() - gameState.startTime;
    const laneWidth = canvas.width / config.lanes;
    const hitY = canvas.height * config.hitLineY;
    const topY = canvas.height * 0.15;
    const travelTime = 2000 / (config.noteSpeed / 5); // Time for note to travel from top to hit line
    
    for (let note of notes) {
        if (note.hit || note.missed) continue;
        
        const timeToHit = note.time - currentTime;
        if (timeToHit > travelTime || timeToHit < -500) continue;
        
        // Calculate Y position
        const progress = 1 - (timeToHit / travelTime);
        const y = topY + (hitY - topY) * progress;
        
        if (y < topY - 50 || y > hitY + 100) continue;
        
        // Calculate X position with perspective
        const perspectiveFactor = 0.4 + 0.6 * progress;
        const centerX = canvas.width / 2;
        const baseX = note.lane * laneWidth + laneWidth / 2;
        const x = centerX + (baseX - centerX) * perspectiveFactor;
        
        // Calculate size with perspective
        const size = 30 + 20 * progress;
        
        // Draw note glow
        const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 1.5);
        glowGradient.addColorStop(0, 'rgba(100, 255, 200, 0.6)');
        glowGradient.addColorStop(0.5, 'rgba(100, 200, 255, 0.3)');
        glowGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGradient;
        ctx.fillRect(x - size * 1.5, y - size * 1.5, size * 3, size * 3);
        
        // Draw note (diamond shape)
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(Math.PI / 4);
        
        // Note gradient
        const noteGradient = ctx.createLinearGradient(-size/2, -size/2, size/2, size/2);
        noteGradient.addColorStop(0, '#80ffff');
        noteGradient.addColorStop(0.5, '#40e0d0');
        noteGradient.addColorStop(1, '#00bfff');
        
        ctx.fillStyle = noteGradient;
        ctx.fillRect(-size/2, -size/2, size, size);
        
        // Note border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(-size/2, -size/2, size, size);
        
        ctx.restore();
    }
}

// Draw hit line
function drawHitLine() {
    const hitY = canvas.height * config.hitLineY;
    const laneWidth = canvas.width / config.lanes;
    
    // Draw hit zone rectangles
    for (let i = 0; i < config.lanes; i++) {
        const x = i * laneWidth;
        
        // Hit zone background
        const zoneGradient = ctx.createLinearGradient(0, hitY - 30, 0, hitY + 30);
        zoneGradient.addColorStop(0, 'rgba(180, 100, 255, 0.1)');
        zoneGradient.addColorStop(0.5, 'rgba(180, 100, 255, 0.4)');
        zoneGradient.addColorStop(1, 'rgba(180, 100, 255, 0.1)');
        
        ctx.fillStyle = zoneGradient;
        ctx.fillRect(x + 5, hitY - 25, laneWidth - 10, 50);
        
        // Hit zone border
        ctx.strokeStyle = 'rgba(180, 100, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 5, hitY - 25, laneWidth - 10, 50);
    }
    
    // Draw glow line
    ctx.shadowColor = '#ff6be6';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.moveTo(0, hitY);
    ctx.lineTo(canvas.width, hitY);
    ctx.strokeStyle = 'rgba(255, 107, 230, 0.8)';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.shadowBlur = 0;
}

// Draw particles
function drawParticles() {
    for (let p of particles) {
        if (p.type === 'flash') {
            ctx.fillStyle = p.color + Math.floor(p.alpha * 128).toString(16).padStart(2, '0');
            ctx.fillRect(p.x, 0, p.width, canvas.height);
        } else {
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }
}

// Draw key hints
function drawKeyHints() {
    const laneWidth = canvas.width / config.lanes;
    const y = canvas.height * 0.92;
    
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(200, 180, 255, 0.6)';
    
    for (let i = 0; i < config.lanes; i++) {
        const x = i * laneWidth + laneWidth / 2;
        ctx.fillText(laneKeys[i].toUpperCase(), x, y);
    }
}

// End the game
function endGame() {
    gameState.isPlaying = false;
    
    if (gameLoopId) {
        cancelAnimationFrame(gameLoopId);
    }
    
    cleanupInputHandlers();
    
    // Calculate results
    const totalNotes = gameState.perfect + gameState.great + gameState.good + gameState.miss;
    const accuracy = totalNotes > 0 ?
        ((gameState.perfect * 100 + gameState.great * 70 + gameState.good * 40) / totalNotes) : 0;
    
    // Show results
    showResults({
        score: gameState.score,
        maxCombo: gameState.maxCombo,
        accuracy: accuracy,
        perfect: gameState.perfect,
        great: gameState.great,
        good: gameState.good,
        miss: gameState.miss
    });
}
