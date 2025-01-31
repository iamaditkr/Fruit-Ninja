
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
const CANVAS_WIDTH = canvas.width = window.innerWidth;
const CANVAS_HEIGHT = canvas.height = window.innerHeight;
const collisionCanvas = document.getElementById('collisionCanvas');
const collisionCtx = collisionCanvas.getContext('2d');
const CollisionCanvas_WIDTH = collisionCanvas.width = window.innerWidth;
const CollisionCanvas_HEIGHT = collisionCanvas.height = window.innerHeight;
ctx.font = '50px Impact';

let timeToNextFruit = 0;
let fruitInterval = 1500;
let lastTime = 0;
let score = 0;
let missedFruits = 0;
let gameOver = false;

const playerImage = new Image();
playerImage.src = 'images/background_extended.jpg';
const gameOverImg = new Image();
gameOverImg.src = 'images/game-over.png';
const logo = new Image();
logo.src = 'images/logo.png';
const logo2 = new Image();
logo2.src = 'images/ninja.png';

// Load missed fruit indicators
const missedImages = {
    x: { normal: 'images/x.png', failed: 'images/xf.png' },
    xx: { normal: 'images/xx.png', failed: 'images/xxf.png' },
    xxx: { normal: 'images/xxx.png', failed: 'images/xxxf.png' },
};
const missedIndicators = {
    x: new Image(),
    xx: new Image(),
    xxx: new Image(),
};
missedIndicators.x.src = missedImages.x.normal;
missedIndicators.xx.src = missedImages.xx.normal;
missedIndicators.xxx.src = missedImages.xxx.normal;

function updateMissedIndicators() {
    if (missedFruits === 1) missedIndicators.x.src = missedImages.x.failed;
    if (missedFruits === 2) missedIndicators.xx.src = missedImages.xx.failed;
    if (missedFruits === 3) missedIndicators.xxx.src = missedImages.xxx.failed;
}

function gameScore() {
    ctx.fillStyle = 'black';
    ctx.fillText(`Score : ${score}`, 20, 50);
    ctx.fillStyle = 'white';
    ctx.fillText(`Score : ${score}`, 25, 55);

    // Draw missed fruit indicators
    const scaledWidth = 50;
    const scaledHeight = 50;
    const gap = 5;
    ctx.drawImage(missedIndicators.x, CANVAS_WIDTH - 3 * (scaledWidth + gap), 10, scaledWidth, scaledHeight);
    ctx.drawImage(missedIndicators.xx, CANVAS_WIDTH - 2 * (scaledWidth + gap), 10, scaledWidth, scaledHeight);
    ctx.drawImage(missedIndicators.xxx, CANVAS_WIDTH - (scaledWidth + gap), 10, scaledWidth, scaledHeight);
}

let fruitsArray = [];
class Fruit {
    constructor() {
        this.width = 70;
        this.height = 70;
        this.x = Math.floor(Math.random() * (CANVAS_WIDTH - this.width));
        this.y = CANVAS_HEIGHT;
        this.speed = Math.random() * 2;
        this.gravity = 0.1;
        this.velocityX = (Math.random() - 0.5) * 4;
        this.velocityY = -(Math.random() * 8 + 5);
        this.deleted = false;
        this.imageNumber = Math.floor(Math.random() * 6 + 1);
        this.image = new Image();
        this.image.src = `images/fruit/${this.imageNumber}.png`;
        this.sound = new Audio();
        this.sound.src = 'sound/splatter.ogg';
    }

    update() {
        if (gameOver) return;

        this.velocityY += this.gravity;
        this.y += this.velocityY;
        this.x += this.velocityX;

        if (this.x < 0) {
            this.x = 0;
            this.velocityX *= -1;
        }
        if (this.x + this.width > CANVAS_WIDTH) {
            this.x = CANVAS_WIDTH - this.width;
            this.velocityX *= -1;
        }
        if (this.y < 0) {
            this.y = 0;
            this.velocityY *= -1;
        }

        if (this.y > CANVAS_HEIGHT) {
            this.deleted = true;
            if (this.imageNumber !== 6) { // Only update missed indicators for non-bombs
                missedFruits++;
                updateMissedIndicators();
                if (missedFruits > 2) {
                    triggerGameOver();
                }
            }
        }
    }

    draw() {
        collisionCtx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        collisionCtx.fillRect(this.x, this.y, this.width, this.height + 10);
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    isHovered(mouseX, mouseY) {
        return (
            mouseX >= this.x &&
            mouseX <= this.x + this.width &&
            mouseY >= this.y &&
            mouseY <= this.y + this.height
        );
    }
}

// Track mouse position
let mouseX = 0;
let mouseY = 0;

canvas.addEventListener("mousemove", function (e) {
    mouseX = e.offsetX;
    mouseY = e.offsetY;
});

// Handle fruit bursting
canvas.addEventListener("mousedown", function () {
    if (gameOver) return;

    fruitsArray = fruitsArray.filter(fruit => {
        if (fruit.isHovered(mouseX, mouseY) && !fruit.deleted) {
            fruit.sound.currentTime = 0;
            fruit.sound.play();

            if (fruit.imageNumber === 6) {
                triggerGameOver();
                return false;
            }

            // Assign different scores based on the fruit
            let scoreValues = { 5: 1, 4: 2, 3: 3, 2: 5, 1: 4 };
            score += scoreValues[fruit.imageNumber] || 0;

            return false;
        }
        return true;
    });
});

// Game over function
function triggerGameOver() {
    gameOver = true;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = 'white';
    ctx.font = '60px Impact';

    ctx.drawImage(logo, CANVAS_WIDTH / 2 - 266, CANVAS_HEIGHT / 5);
    ctx.drawImage(logo2, CANVAS_WIDTH / 2 + 22, CANVAS_HEIGHT / 5 + 54);
    ctx.drawImage(gameOverImg, CANVAS_WIDTH / 2 - 245, CANVAS_HEIGHT / 2 - 100);
    ctx.fillText(`Your Score: ${score}`, CANVAS_WIDTH / 2 - 150, CANVAS_HEIGHT / 2 + 60);
    setTimeout(() => window.location.reload(), 3000);
}

function animate(timeWait) {
    if (gameOver) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    collisionCtx.clearRect(0, 0, CollisionCanvas_WIDTH, CollisionCanvas_HEIGHT);
    ctx.drawImage(playerImage, 0, 0, 1408, 672, 0, 0, collisionCanvas.width, collisionCanvas.height);
    gameScore();

    let timeDifference = timeWait - lastTime;
    lastTime = timeWait;
    timeToNextFruit += timeDifference;
    if (timeToNextFruit > fruitInterval) {
        fruitsArray.push(new Fruit());
        timeToNextFruit = 0;
    }

    fruitsArray.forEach(fruit => {
        fruit.update();
        fruit.draw();
    });

    fruitsArray = fruitsArray.filter(fruit => !fruit.deleted);
    requestAnimationFrame(animate);
}

animate(0);