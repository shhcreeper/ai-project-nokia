// Fast Gay Frog Adventure - Game Logic
// Using Three.js for 3D graphics

import * as THREE from 'three';

// Game Configuration
const CONFIG = {
    frogSpeed: 0.15,
    jumpPower: 0.3,
    gravity: 0.015,
    platformCount: 15,
    collectibleCount: 10,
    cameraDistance: 10,
    cameraHeight: 5
};

// Game State
let scene, camera, renderer, clock;
let frog, platforms = [], collectibles = [];
let velocity = { x: 0, y: 0, z: 0 };
let isGrounded = false;
let score = 0;
let itemsCollected = 0;
let keys = {};
let gameStarted = false;
let gameWon = false;

// Initialize the game
function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.Fog(0x001100, 20, 50);

    // Setup camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, CONFIG.cameraHeight, CONFIG.cameraDistance);
    camera.lookAt(0, 0, 0);

    // Setup renderer
    renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(1); // Pixelated look
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x00ff00, 0.8);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    // Create the fabulous gay frog
    createFrog();

    // Create platforms
    createPlatforms();

    // Create collectibles
    createCollectibles();

    // Setup clock for animation
    clock = new THREE.Clock();

    // Event listeners
    window.addEventListener('resize', onWindowResize);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.getElementById('start-button').addEventListener('click', startGame);
    document.getElementById('restart-button').addEventListener('click', restartGame);

    // Start animation loop
    animate();
}

// Create rainbow-colored frog
function createFrog() {
    const frogGroup = new THREE.Group();

    // Body (rainbow gradient effect with multiple colored cubes)
    const bodyGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.8);
    
    // Create rainbow body with color segments
    const rainbowColors = [0xff0000, 0xff7f00, 0xffff00, 0x00ff00, 0x0000ff, 0x9400d3];
    
    for (let i = 0; i < 6; i++) {
        const segment = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, 0.1, 0.8),
            new THREE.MeshPhongMaterial({ 
                color: rainbowColors[i],
                emissive: rainbowColors[i],
                emissiveIntensity: 0.3
            })
        );
        segment.position.y = -0.25 + (i * 0.1);
        frogGroup.add(segment);
    }

    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    const eyeMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xffffff,
        emissive: 0x00ffff,
        emissiveIntensity: 0.5
    });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.2, 0.3, 0.35);
    frogGroup.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.2, 0.3, 0.35);
    frogGroup.add(rightEye);

    // Pupils
    const pupilGeometry = new THREE.SphereGeometry(0.08, 8, 8);
    const pupilMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    
    const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    leftPupil.position.set(-0.2, 0.3, 0.42);
    frogGroup.add(leftPupil);
    
    const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    rightPupil.position.set(0.2, 0.3, 0.42);
    frogGroup.add(rightPupil);

    // Legs (simplified)
    const legGeometry = new THREE.BoxGeometry(0.2, 0.4, 0.2);
    const legMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x00ff00,
        emissive: 0x00ff00,
        emissiveIntensity: 0.2
    });
    
    const legPositions = [
        [-0.25, -0.5, 0.2],
        [0.25, -0.5, 0.2],
        [-0.25, -0.5, -0.2],
        [0.25, -0.5, -0.2]
    ];
    
    legPositions.forEach(pos => {
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.set(...pos);
        frogGroup.add(leg);
    });

    frogGroup.position.set(0, 2, 0);
    scene.add(frogGroup);
    frog = frogGroup;
}

// Create platforms at different heights
function createPlatforms() {
    // Starting platform
    createPlatform(0, 0, 0, 4, 0.5, 4, 0x00ff00);

    // Generate platforms in a path
    let lastX = 0;
    let lastZ = -4;
    let lastY = 0;

    for (let i = 0; i < CONFIG.platformCount; i++) {
        const x = lastX + (Math.random() - 0.5) * 4;
        const z = lastZ - (3 + Math.random() * 2);
        const y = lastY + (Math.random() - 0.3) * 2;
        
        const width = 2 + Math.random() * 2;
        const depth = 2 + Math.random() * 2;
        
        // Rainbow colored platforms
        const hue = (i / CONFIG.platformCount) * 360;
        const color = new THREE.Color().setHSL(hue / 360, 0.8, 0.5);
        
        createPlatform(x, y, z, width, 0.5, depth, color.getHex());
        
        lastX = x;
        lastZ = z;
        lastY = y;
    }

    // Finish platform (special)
    createPlatform(lastX, lastY + 2, lastZ - 5, 5, 0.5, 5, 0xff00ff, true);
}

function createPlatform(x, y, z, width, height, depth, color, isFinish = false) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshPhongMaterial({ 
        color: color,
        emissive: color,
        emissiveIntensity: isFinish ? 0.5 : 0.2
    });
    const platform = new THREE.Mesh(geometry, material);
    platform.position.set(x, y, z);
    platform.userData.isFinish = isFinish;
    scene.add(platform);
    platforms.push(platform);

    // Add outline for retro look
    const edges = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineSegments(
        edges, 
        new THREE.LineBasicMaterial({ color: 0x00ff00 })
    );
    line.position.copy(platform.position);
    scene.add(line);
}

// Create collectible items (flies with pride flags)
function createCollectibles() {
    const collectibleGeometry = new THREE.OctahedronGeometry(0.3, 0);
    
    // Place collectibles on platforms
    for (let i = 0; i < CONFIG.collectibleCount && i < platforms.length; i++) {
        const platform = platforms[Math.floor((i / CONFIG.collectibleCount) * platforms.length)];
        
        // Rainbow colors for collectibles
        const hue = (i / CONFIG.collectibleCount) * 360;
        const color = new THREE.Color().setHSL(hue / 360, 1.0, 0.6);
        
        const material = new THREE.MeshPhongMaterial({
            color: color.getHex(),
            emissive: color.getHex(),
            emissiveIntensity: 0.8
        });
        
        const collectible = new THREE.Mesh(collectibleGeometry, material);
        collectible.position.set(
            platform.position.x + (Math.random() - 0.5) * 1.5,
            platform.position.y + 1.5,
            platform.position.z + (Math.random() - 0.5) * 1.5
        );
        
        scene.add(collectible);
        collectibles.push(collectible);
    }
}

// Handle keyboard input
function onKeyDown(event) {
    keys[event.key.toLowerCase()] = true;
    
    // Restart key
    if (event.key.toLowerCase() === 'r') {
        restartGame();
    }
}

function onKeyUp(event) {
    keys[event.key.toLowerCase()] = false;
}

// Game controls
function handleControls() {
    if (!gameStarted || gameWon) return;

    // Horizontal movement
    if (keys['a'] || keys['arrowleft']) {
        velocity.x = -CONFIG.frogSpeed;
    } else if (keys['d'] || keys['arrowright']) {
        velocity.x = CONFIG.frogSpeed;
    } else {
        velocity.x *= 0.8; // Friction
    }

    // Forward/backward movement
    if (keys['w'] || keys['arrowup']) {
        velocity.z = -CONFIG.frogSpeed;
    } else if (keys['s'] || keys['arrowdown']) {
        velocity.z = CONFIG.frogSpeed;
    } else {
        velocity.z *= 0.8; // Friction
    }

    // Jumping
    if (keys[' '] && isGrounded) {
        velocity.y = CONFIG.jumpPower;
        isGrounded = false;
    }
}

// Physics update
function updatePhysics() {
    if (!gameStarted || gameWon) return;

    // Apply gravity
    velocity.y -= CONFIG.gravity;

    // Update position
    frog.position.x += velocity.x;
    frog.position.y += velocity.y;
    frog.position.z += velocity.z;

    // Check platform collisions
    isGrounded = false;
    platforms.forEach(platform => {
        if (checkPlatformCollision(frog, platform)) {
            isGrounded = true;
            velocity.y = 0;
            frog.position.y = platform.position.y + 0.25 + 0.6; // platform half-height + frog half-height
            
            // Check if reached finish
            if (platform.userData.isFinish) {
                winGame();
            }
        }
    });

    // Check collectible collisions
    collectibles.forEach((collectible, index) => {
        if (collectible.visible && checkCollision(frog, collectible)) {
            collectible.visible = false;
            itemsCollected++;
            score += 100;
            updateUI();
        }
    });

    // Fall detection
    if (frog.position.y < -10) {
        resetFrogPosition();
    }

    // Add bounce animation
    if (isGrounded) {
        frog.rotation.x = Math.sin(Date.now() * 0.01) * 0.1;
    } else {
        frog.rotation.x = velocity.y * 0.5;
    }
}

// Collision detection
function checkPlatformCollision(frog, platform) {
    const frogBox = new THREE.Box3().setFromObject(frog);
    const platformBox = new THREE.Box3().setFromObject(platform);
    
    // Check if frog is above platform and falling
    if (velocity.y <= 0 && frogBox.intersectsBox(platformBox)) {
        const frogBottom = frog.position.y - 0.6;
        const platformTop = platform.position.y + 0.25;
        
        // Check if frog was above platform
        if (frogBottom >= platformTop - 0.5 && frogBottom <= platformTop + 0.5) {
            return true;
        }
    }
    return false;
}

function checkCollision(obj1, obj2) {
    const distance = obj1.position.distanceTo(obj2.position);
    return distance < 0.8;
}

// Camera follow
function updateCamera() {
    if (!frog) return;
    
    // Smooth camera follow
    const targetX = frog.position.x;
    const targetY = frog.position.y + CONFIG.cameraHeight;
    const targetZ = frog.position.z + CONFIG.cameraDistance;
    
    camera.position.x += (targetX - camera.position.x) * 0.1;
    camera.position.y += (targetY - camera.position.y) * 0.1;
    camera.position.z += (targetZ - camera.position.z) * 0.1;
    
    camera.lookAt(frog.position);
}

// Update UI
function updateUI() {
    document.getElementById('score').textContent = score.toString().padStart(5, '0');
    document.getElementById('items').textContent = `${itemsCollected}/${CONFIG.collectibleCount}`;
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    
    // Rotate collectibles
    collectibles.forEach(collectible => {
        collectible.rotation.y += delta * 2;
        collectible.position.y += Math.sin(Date.now() * 0.003 + collectible.position.x) * 0.01;
    });
    
    // Handle game logic
    handleControls();
    updatePhysics();
    updateCamera();
    
    renderer.render(scene, camera);
}

// Game state functions
function startGame() {
    gameStarted = true;
    document.getElementById('start-screen').classList.remove('active');
    updateUI();
}

function winGame() {
    gameWon = true;
    document.getElementById('win-screen').classList.add('active');
    document.getElementById('final-score').textContent = score;
    document.getElementById('final-items').textContent = `${itemsCollected}/${CONFIG.collectibleCount}`;
}

function restartGame() {
    // Reset game state
    gameStarted = false;
    gameWon = false;
    score = 0;
    itemsCollected = 0;
    velocity = { x: 0, y: 0, z: 0 };
    
    // Reset frog position
    resetFrogPosition();
    
    // Reset collectibles
    collectibles.forEach(collectible => {
        collectible.visible = true;
    });
    
    // Hide win screen
    document.getElementById('win-screen').classList.remove('active');
    document.getElementById('start-screen').classList.add('active');
    
    updateUI();
}

function resetFrogPosition() {
    frog.position.set(0, 2, 0);
    velocity = { x: 0, y: 0, z: 0 };
}

// Window resize handler
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Initialize game when page loads
window.addEventListener('load', init);
