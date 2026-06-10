// 1. Setup Canvas Context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 2. Track Game Variables
let clicks = 0;
let isCooldown = false;
let boxIsOpen = false;
let shakeIntensity = 0;
let isShaking = false; 
let shakeTimeout = null; // Tracks active shake timer to reset it cleanly on spam clicks

// 3. Create and Load Every Individual Image Asset
const imgFiles = {
    closedBox: "closed box.png",
    openBox: "open box.png",
    happy: "happy.png",
    happyLegs: "happy with legs.png",
    superHappy: "super happy.png",
    superHappyLegs: "super happy with legs.png",
    annoyed: "annoyed.png",
    annoyedLegs: "annoyed with legs.png",
    angry: "angry.png"
};

const images = {};
let loadedCount = 0;
const totalImages = Object.keys(imgFiles).length;

for (let key in imgFiles) {
    images[key] = new Image();
    images[key].src = "../images/" + imgFiles[key]; 
    images[key].onload = () => {
        loadedCount++;
        if (loadedCount === totalImages) {
            updateGameDisplay();
        }
    };
}

// 4. Standard Drawing Helper Function
function drawScene(imgElement, xOffset = 0, yOffset = 0) {
    const x = (canvas.width - imgElement.width) / 2 + xOffset;
    const y = (canvas.height - imgElement.height) / 2 + yOffset;
    ctx.drawImage(imgElement, x, y);
}

// 5. Handle Mouse Click Interactions
canvas.addEventListener("click", function() {
    // If clicked during the 1-minute timeout, shake the box aggressively
    if (isCooldown) {
        triggerBoxShake(2000); 
        return; 
    }

    clicks++;
    
    if (clicks < 25) {
        boxIsOpen = true;
        updateGameDisplay();
        
        // Auto-close the box after 250 milliseconds
        setTimeout(() => {
            boxIsOpen = false;
            updateGameDisplay();
        }, 250);
    } 
    else if (clicks === 25) {
        startCooldownTimer();
    }
});

// 6. Determine which specific asset to draw
function updateGameDisplay() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background fill 
    ctx.fillStyle = "#AEC6CF"; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // COOLDOWN STATE
    if (isCooldown) {
        let offsetX = 0;
        let offsetY = 0;
        
        if (isShaking) {
            offsetX = (Math.random() - 0.5) * shakeIntensity;
            offsetY = (Math.random() - 0.5) * shakeIntensity;
        }
        
        drawScene(images.closedBox, offsetX, offsetY);
        return;
    }

    // DEFAULT CLOSED STATE
    if (!boxIsOpen) {
        drawScene(images.closedBox);
        return;
    }

    // DYNAMIC POP-OUT STATES
    if (clicks < 10) {
        drawScene(images.openBox);
        drawScene(images.superHappyLegs); 
    } else if (clicks < 20) {
        drawScene(images.openBox);
        drawScene(images.annoyedLegs);
    } else if (clicks < 25) {
        drawScene(images.angry);
    }
}

// 7. Shaking Handler Utility
function triggerBoxShake(duration) {
    // Reset old timer if player clicks while it's already shaking
    if (shakeTimeout) clearTimeout(shakeTimeout);

    isShaking = true;
    shakeIntensity = 8;
    
    runShakeAnimation();

    shakeTimeout = setTimeout(() => {
        isShaking = false;
        updateGameDisplay(); // Snaps box back to a static center
    }, duration);
}

// 8. Start Cooldown and Run the 1-Minute Lockout
function startCooldownTimer() {
    isCooldown = true;
    
    // Initial 2-second angry rattle when it first snaps shut
    triggerBoxShake(2000); 

    // 1-minute (60000ms) lock tracker running silently in the background
    setTimeout(() => {
        isCooldown = false;
        clicks = 0;
        shakeIntensity = 0;
        isShaking = false;
        updateGameDisplay(); // Unlocks the box cleanly
    }, 60000);
}

// 9. Continuous Shaking Loop Animation Frame
function runShakeAnimation() {
    if (!isCooldown || !isShaking) return;
    
    updateGameDisplay();
    requestAnimationFrame(runShakeAnimation);
}