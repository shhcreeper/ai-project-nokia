// Dialogue System with Pixel Characters

// Pixel character definitions (8-bit style sprites as canvas data)
const pixelCharacters = {
    rui: {
        // Purple themed inventor character
        colors: {
            hair: '#6a0dad',
            skin: '#ffd5b4',
            outfit: '#4a0080',
            accent: '#ff6be6'
        },
        frames: {
            idle: [0, 1],
            dance: [2, 3, 4, 5, 6, 7]
        }
    },
    tsukasa: {
        // Orange/yellow star character
        colors: {
            hair: '#ffaa00',
            skin: '#ffd5b4',
            outfit: '#ff6600',
            accent: '#ffff00'
        },
        frames: {
            idle: [0, 1],
            dance: [2, 3, 4, 5, 6, 7]
        }
    }
};

// Draw a pixel character on canvas
function drawPixelCharacter(ctx, character, x, y, scale, frame) {
    const colors = pixelCharacters[character].colors;
    const pixelSize = scale;
    
    ctx.imageSmoothingEnabled = false;
    
    // Pixel art character data (16x24 grid)
    const sprites = getCharacterSprite(character, frame);
    
    sprites.forEach((row, rowIndex) => {
        row.forEach((pixel, colIndex) => {
            if (pixel !== 0) {
                ctx.fillStyle = getPixelColor(colors, pixel);
                ctx.fillRect(
                    x + colIndex * pixelSize,
                    y + rowIndex * pixelSize,
                    pixelSize,
                    pixelSize
                );
            }
        });
    });
}

function getPixelColor(colors, code) {
    switch(code) {
        case 1: return colors.hair;
        case 2: return colors.skin;
        case 3: return colors.outfit;
        case 4: return colors.accent;
        case 5: return '#ffffff';
        case 6: return '#000000';
        default: return 'transparent';
    }
}

function getCharacterSprite(character, frame) {
    // Basic pixel art character sprite (16 wide x 24 tall)
    // 0 = transparent, 1 = hair, 2 = skin, 3 = outfit, 4 = accent, 5 = white, 6 = black
    
    const baseSprite = [
        [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
        [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
        [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
        [0,0,0,1,1,2,2,2,2,2,2,1,1,0,0,0],
        [0,0,0,1,2,2,2,2,2,2,2,2,1,0,0,0],
        [0,0,0,0,2,6,2,2,2,2,6,2,0,0,0,0],
        [0,0,0,0,2,2,2,2,2,2,2,2,0,0,0,0],
        [0,0,0,0,0,2,2,6,6,2,2,0,0,0,0,0],
        [0,0,0,0,0,0,2,2,2,2,0,0,0,0,0,0],
        [0,0,0,0,3,3,3,3,3,3,3,3,0,0,0,0],
        [0,0,0,3,3,3,4,3,3,4,3,3,3,0,0,0],
        [0,0,0,3,3,3,3,3,3,3,3,3,3,0,0,0],
        [0,0,2,3,3,3,3,3,3,3,3,3,3,2,0,0],
        [0,0,2,3,3,3,3,3,3,3,3,3,3,2,0,0],
        [0,0,0,3,3,3,3,3,3,3,3,3,3,0,0,0],
        [0,0,0,3,3,3,3,3,3,3,3,3,3,0,0,0],
        [0,0,0,0,3,3,3,0,0,3,3,3,0,0,0,0],
        [0,0,0,0,3,3,3,0,0,3,3,3,0,0,0,0],
        [0,0,0,0,3,3,3,0,0,3,3,3,0,0,0,0],
        [0,0,0,0,3,3,3,0,0,3,3,3,0,0,0,0],
        [0,0,0,0,6,6,6,0,0,6,6,6,0,0,0,0],
    ];
    
    // Apply dance animation modifications based on frame
    const danceFrame = frame % 8;
    const sprite = JSON.parse(JSON.stringify(baseSprite));
    
    // Simple dance animation - arm positions change
    if (danceFrame === 2 || danceFrame === 6) {
        // Arms up left
        sprite[12] = [0,2,0,3,3,3,3,3,3,3,3,3,3,0,2,0];
        sprite[13] = [2,0,0,3,3,3,3,3,3,3,3,3,3,0,0,2];
    } else if (danceFrame === 3 || danceFrame === 7) {
        // Arms up both
        sprite[12] = [2,0,0,3,3,3,3,3,3,3,3,3,3,0,0,2];
        sprite[13] = [0,2,0,3,3,3,3,3,3,3,3,3,3,0,2,0];
    } else if (danceFrame === 4) {
        // Arms up right
        sprite[12] = [0,0,2,3,3,3,3,3,3,3,3,3,3,2,0,0];
        sprite[13] = [0,2,0,3,3,3,3,3,3,3,3,3,3,0,2,0];
    } else if (danceFrame === 5) {
        // Lean
        sprite[9] = [0,0,0,0,0,3,3,3,3,3,3,3,3,0,0,0];
        sprite[10] = [0,0,0,0,3,3,4,3,3,4,3,3,3,0,0,0];
    }
    
    // Bounce effect
    if (danceFrame === 1 || danceFrame === 3 || danceFrame === 5 || danceFrame === 7) {
        sprite.unshift([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
        sprite.pop();
    }
    
    return sprite;
}

// Dialogue content
const dialogues = [
    {
        speaker: 'Rui',
        character: 'rui',
        text: 'Fufu~ Tsukasa-kun, are you ready for our wonderful performance?',
        position: 'left'
    },
    {
        speaker: 'Tsukasa',
        character: 'tsukasa', 
        text: 'Of course! A future star like me is ALWAYS ready! The audience awaits!',
        position: 'right'
    },
    {
        speaker: 'Rui',
        character: 'rui',
        text: 'Your enthusiasm is quite... entertaining. Let\'s give them a show they\'ll never forget.',
        position: 'left'
    },
    {
        speaker: 'Tsukasa',
        character: 'tsukasa',
        text: 'Together, we shall create the most BRILLIANT performance this stage has ever seen!',
        position: 'right'
    },
    {
        speaker: 'Rui',
        character: 'rui',
        text: 'Indeed. Now, let the rhythm guide us... The curtain rises!',
        position: 'left'
    }
];

let currentDialogueIndex = 0;
let dialogueCanvas = null;
let dialogueCtx = null;
let dialogueAnimationFrame = 0;
let dialogueAnimationId = null;

function startDialogue() {
    currentDialogueIndex = 0;
    
    // Create canvas for pixel characters in dialogue
    const container = document.querySelector('.dialogue-container');
    
    // Remove existing canvas if any
    const existingCanvas = container.querySelector('.dialogue-pixel-canvas');
    if (existingCanvas) existingCanvas.remove();
    
    dialogueCanvas = document.createElement('canvas');
    dialogueCanvas.className = 'dialogue-pixel-canvas';
    dialogueCanvas.style.position = 'absolute';
    dialogueCanvas.style.top = '0';
    dialogueCanvas.style.left = '0';
    dialogueCanvas.style.width = '100%';
    dialogueCanvas.style.height = '100%';
    dialogueCanvas.style.pointerEvents = 'none';
    dialogueCanvas.style.imageRendering = 'pixelated';
    container.insertBefore(dialogueCanvas, container.firstChild.nextSibling);
    
    resizeDialogueCanvas();
    dialogueCtx = dialogueCanvas.getContext('2d');
    
    updateDialogue();
    animateDialogueCharacters();
    
    // Add click listener
    document.querySelector('.dialogue-box').addEventListener('click', nextDialogue);
    window.addEventListener('resize', resizeDialogueCanvas);
}

function resizeDialogueCanvas() {
    if (dialogueCanvas) {
        dialogueCanvas.width = window.innerWidth;
        dialogueCanvas.height = window.innerHeight;
    }
}

function animateDialogueCharacters() {
    if (!dialogueCtx) return;
    
    dialogueCtx.clearRect(0, 0, dialogueCanvas.width, dialogueCanvas.height);
    
    const scale = Math.min(dialogueCanvas.width / 800, dialogueCanvas.height / 600) * 8;
    const charWidth = 16 * scale;
    const charHeight = 21 * scale;
    
    // Draw left character (Rui)
    drawPixelCharacter(
        dialogueCtx,
        'rui',
        dialogueCanvas.width * 0.15 - charWidth / 2,
        dialogueCanvas.height * 0.35,
        scale,
        Math.floor(dialogueAnimationFrame / 10)
    );
    
    // Draw right character (Tsukasa)
    drawPixelCharacter(
        dialogueCtx,
        'tsukasa',
        dialogueCanvas.width * 0.85 - charWidth / 2,
        dialogueCanvas.height * 0.35,
        scale,
        Math.floor(dialogueAnimationFrame / 10) + 2
    );
    
    dialogueAnimationFrame++;
    dialogueAnimationId = requestAnimationFrame(animateDialogueCharacters);
}

function updateDialogue() {
    const dialogue = dialogues[currentDialogueIndex];
    document.getElementById('speaker-name').textContent = dialogue.speaker;
    document.getElementById('dialogue-text').textContent = dialogue.text;
}

function nextDialogue() {
    currentDialogueIndex++;
    
    if (currentDialogueIndex >= dialogues.length) {
        // End dialogue, go to song select
        if (dialogueAnimationId) {
            cancelAnimationFrame(dialogueAnimationId);
        }
        document.querySelector('.dialogue-box').removeEventListener('click', nextDialogue);
        window.removeEventListener('resize', resizeDialogueCanvas);
        showSongSelect();
    } else {
        updateDialogue();
    }
}

// Export for use in rhythm game
window.drawPixelCharacter = drawPixelCharacter;
window.pixelCharacters = pixelCharacters;
window.getCharacterSprite = getCharacterSprite;
