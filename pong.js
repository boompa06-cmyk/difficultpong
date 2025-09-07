// Game canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const SCREEN_WIDTH = 800;
const SCREEN_HEIGHT = 600;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;
const BALL_SIZE = 20;
const PADDLE_SPEED = 7;
const BALL_SPEED = 5;

// Game states
const MAIN_MENU = 0;
const PLAYING = 1;
const GAME_OVER = 2;

// Colors
const BLACK = '#000000';
const WHITE = '#FFFFFF';
const RED = '#FF0000';
const ORANGE = '#FFA500';
const YELLOW = '#FFFF00';
const GREEN = '#00FF00';
const BLUE = '#0000FF';
const PURPLE = '#800080';
const GRAY = '#808080';

// Game class
class PongGame {
    constructor() {
        this.state = MAIN_MENU;
        this.winScore = 5;
        this.scoreOptions = [3, 5, 7, 11, 15, 21];
        this.selectedScoreIndex = 1; // Default to 5
        
        this.leftScore = 0;
        this.rightScore = 0;
        this.winner = '';
        
        this.explosion = null;
        this.particles = [];
        
        // Create game objects
        this.leftPaddle = new Paddle(50, SCREEN_HEIGHT / 2 - PADDLE_HEIGHT / 2);
        this.rightPaddle = new Paddle(SCREEN_WIDTH - 60, SCREEN_HEIGHT / 2 - PADDLE_HEIGHT / 2);
        this.ball = new Ball();
        
        // Input handling
        this.keys = {};
        this.mouse = { x: 0, y: 0, clicked: false };
        
        this.setupEventListeners();
        this.gameLoop();
    }
    
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        // Mouse events
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });
        
        canvas.addEventListener('click', (e) => {
            this.handleClick(e);
        });
    }
    
    handleClick(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (this.state === MAIN_MENU) {
            // Start button area
            if (x > 300 && x < 500 && y > 250 && y < 300) {
                this.startGame();
            }
            // Score selection buttons
            if (x > 250 && x < 290 && y > 180 && y < 220) { // Left arrow
                this.selectedScoreIndex = (this.selectedScoreIndex - 1 + this.scoreOptions.length) % this.scoreOptions.length;
                this.winScore = this.scoreOptions[this.selectedScoreIndex];
            }
            if (x > 510 && x < 550 && y > 180 && y < 220) { // Right arrow
                this.selectedScoreIndex = (this.selectedScoreIndex + 1) % this.scoreOptions.length;
                this.winScore = this.scoreOptions[this.selectedScoreIndex];
            }
        } else if (this.state === GAME_OVER) {
            // Play again button
            if (x > 300 && x < 500 && y > 400 && y < 450) {
                this.startGame();
            }
            // Main menu button
            if (x > 300 && x < 500 && y > 470 && y < 520) {
                this.state = MAIN_MENU;
            }
        }
    }
    
    startGame() {
        this.state = PLAYING;
        this.leftScore = 0;
        this.rightScore = 0;
        this.winner = '';
        this.explosion = null;
        this.particles = [];
        this.ball.reset();
    }
    
    update() {
        if (this.state === PLAYING) {
            this.updateGame();
        }
        
        // Update explosion particles
        this.particles = this.particles.filter(particle => {
            particle.update();
            return particle.life > 0;
        });
    }
    
    updateGame() {
        // Handle input
        if (this.keys['w']) this.leftPaddle.moveUp();
        if (this.keys['s']) this.leftPaddle.moveDown();
        if (this.keys['arrowup']) this.rightPaddle.moveUp();
        if (this.keys['arrowdown']) this.rightPaddle.moveDown();
        
        // Update ball
        this.ball.update();
        
        // Ball collision with paddles
        if (this.ball.collidesWith(this.leftPaddle) || this.ball.collidesWith(this.rightPaddle)) {
            this.ball.speedX = -this.ball.speedX;
        }
        
        // Ball goes off screen - scoring
        if (this.ball.x < 0) {
            this.rightScore++;
            this.createExplosion(this.ball.x, this.ball.y);
            this.checkWinCondition();
            if (this.state === PLAYING) this.ball.reset();
        } else if (this.ball.x > SCREEN_WIDTH) {
            this.leftScore++;
            this.createExplosion(this.ball.x, this.ball.y);
            this.checkWinCondition();
            if (this.state === PLAYING) this.ball.reset();
        }
    }
    
    createExplosion(x, y) {
        const colors = [RED, ORANGE, YELLOW, WHITE];
        for (let i = 0; i < 8; i++) {
            this.particles.push(new Particle(x, y, colors[Math.floor(Math.random() * colors.length)]));
        }
    }
    
    checkWinCondition() {
        if (this.leftScore >= this.winScore) {
            this.winner = 'LEFT PLAYER WINS!';
            this.state = GAME_OVER;
        } else if (this.rightScore >= this.winScore) {
            this.winner = 'RIGHT PLAYER WINS!';
            this.state = GAME_OVER;
        }
    }
    
    draw() {
        // Clear canvas
        ctx.fillStyle = BLACK;
        ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
        
        if (this.state === MAIN_MENU) {
            this.drawMainMenu();
        } else if (this.state === PLAYING) {
            this.drawGame();
        } else if (this.state === GAME_OVER) {
            this.drawGameOver();
        }
    }
    
    drawMainMenu() {
        // Title
        ctx.fillStyle = WHITE;
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('EPIC PONG', SCREEN_WIDTH / 2, 100);
        
        // Score selection
        ctx.font = '24px Arial';
        ctx.fillText('First to Win:', SCREEN_WIDTH / 2, 160);
        
        ctx.fillStyle = YELLOW;
        ctx.font = '32px Arial';
        ctx.fillText(this.winScore.toString(), SCREEN_WIDTH / 2, 200);
        
        // Arrows
        ctx.fillStyle = WHITE;
        ctx.fillText('<', 270, 200);
        ctx.fillText('>', 530, 200);
        
        // Start button
        ctx.strokeStyle = WHITE;
        ctx.strokeRect(300, 250, 200, 50);
        ctx.fillStyle = WHITE;
        ctx.font = '24px Arial';
        ctx.fillText('START GAME', SCREEN_WIDTH / 2, 280);
    }
    
    drawGame() {
        // Draw center line
        ctx.strokeStyle = WHITE;
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(SCREEN_WIDTH / 2, 0);
        ctx.lineTo(SCREEN_WIDTH / 2, SCREEN_HEIGHT);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw paddles
        this.leftPaddle.draw();
        this.rightPaddle.draw();
        
        // Draw ball
        this.ball.draw();
        
        // Draw scores
        ctx.fillStyle = WHITE;
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.leftScore.toString(), SCREEN_WIDTH / 4, 80);
        ctx.fillText(this.rightScore.toString(), 3 * SCREEN_WIDTH / 4, 80);
        
        // Draw target
        ctx.font = '16px Arial';
        ctx.fillStyle = GRAY;
        ctx.fillText(`First to ${this.winScore}`, SCREEN_WIDTH / 2, 30);
        
        // Draw explosion particles
        this.particles.forEach(particle => particle.draw());
    }
    
    drawGameOver() {
        // Winner text
        ctx.fillStyle = YELLOW;
        ctx.font = '36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.winner, SCREEN_WIDTH / 2, 200);
        
        // Final score
        ctx.fillStyle = WHITE;
        ctx.font = '24px Arial';
        ctx.fillText(`Final Score: ${this.leftScore} - ${this.rightScore}`, SCREEN_WIDTH / 2, 250);
        
        // Buttons
        ctx.strokeStyle = WHITE;
        ctx.strokeRect(300, 400, 200, 50);
        ctx.strokeRect(300, 470, 200, 50);
        
        ctx.fillStyle = WHITE;
        ctx.fillText('PLAY AGAIN', SCREEN_WIDTH / 2, 430);
        ctx.fillText('MAIN MENU', SCREEN_WIDTH / 2, 500);
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Game object classes
class Paddle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = PADDLE_WIDTH;
        this.height = PADDLE_HEIGHT;
        this.speed = PADDLE_SPEED;
    }
    
    moveUp() {
        if (this.y > 0) this.y -= this.speed;
    }
    
    moveDown() {
        if (this.y + this.height < SCREEN_HEIGHT) this.y += this.speed;
    }
    
    draw() {
        ctx.fillStyle = WHITE;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Ball {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.x = SCREEN_WIDTH / 2;
        this.y = SCREEN_HEIGHT / 2;
        this.width = BALL_SIZE;
        this.height = BALL_SIZE;
        this.speedX = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
        this.speedY = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
    }
    
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Bounce off top and bottom
        if (this.y <= 0 || this.y + this.height >= SCREEN_HEIGHT) {
            this.speedY = -this.speedY;
        }
    }
    
    collidesWith(paddle) {
        return this.x < paddle.x + paddle.width &&
               this.x + this.width > paddle.x &&
               this.y < paddle.y + paddle.height &&
               this.y + this.height > paddle.y;
    }
    
    draw() {
        ctx.fillStyle = WHITE;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.velX = (Math.random() - 0.5) * 16;
        this.velY = (Math.random() - 0.5) * 16;
        this.life = 10;
        this.maxLife = 10;
        this.size = Math.random() * 5 + 3;
    }
    
    update() {
        this.x += this.velX;
        this.y += this.velY;
        this.velY += 0.2; // gravity
        this.life--;
    }
    
    draw() {
        const alpha = this.life / this.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * alpha, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

// Start the game
const game = new PongGame();