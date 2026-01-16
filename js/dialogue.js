// Dialogue System
let currentDialogueIndex = 0;
let dialogues = [
    {
        speaker: "Rui",
        text: "Fufu~ Tsukasa-kun, are you ready for our wonderful performance?",
        character: "left"
    },
    {
        speaker: "Tsukasa",
        text: "Of course! A star is always ready to shine on stage!",
        character: "right"
    },
    {
        speaker: "Rui",
        text: "Then let's create a show that will captivate the audience~",
        character: "left"
    },
    {
        speaker: "Tsukasa",
        text: "Together, we'll make this the most spectacular performance ever!",
        character: "right"
    },
    {
        speaker: "System",
        text: "Click 'Play' to start the rhythm game!",
        character: "none"
    }
];

// Start dialogue sequence
function startDialogue() {
    currentDialogueIndex = 0;
    displayDialogue();
    
    // Add click handler to dialogue box
    const dialogueBox = document.querySelector('.dialogue-box');
    dialogueBox.onclick = nextDialogue;
}

// Display current dialogue
function displayDialogue() {
    if (currentDialogueIndex >= dialogues.length) {
        // End of dialogue, return to menu (check if function exists)
        if (typeof showMainMenu === 'function') {
            showMainMenu();
        }
        return;
    }
    
    const dialogue = dialogues[currentDialogueIndex];
    
    document.getElementById('speaker-name').textContent = dialogue.speaker;
    document.getElementById('dialogue-text').textContent = dialogue.text;
    
    // Highlight active character
    const charLeft = document.getElementById('char-left');
    const charRight = document.getElementById('char-right');
    
    charLeft.style.opacity = dialogue.character === 'left' ? '1' : '0.5';
    charRight.style.opacity = dialogue.character === 'right' ? '1' : '0.5';
}

// Advance to next dialogue
function nextDialogue() {
    currentDialogueIndex++;
    displayDialogue();
}
