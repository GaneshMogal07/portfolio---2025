// Snake Game Implementation
const GRID_SIZE = 20;
const CELL_SIZE = 20;
const DIFFICULTY_SPEEDS = {
    easy: 180,
    medium: 130,
    hard: 80
};

let snake = [{ x: 10, y: 10 }];
let food = { x: 15, y: 15 };
let direction = 'right';
let gameLoop;
let score = 0;
let currentScoreElement;
let restartButton;
let difficultySelect;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let currentDifficulty = 'easy';
let gameActive = false;
let isPaused = false;
let startPauseButton;

function initGame(canvasId) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    canvas.width = GRID_SIZE * CELL_SIZE;
    canvas.height = GRID_SIZE * CELL_SIZE;

    currentScoreElement = document.getElementById('currentScore');
    restartButton = document.getElementById('restartGame');
    startPauseButton = document.getElementById('startPauseGame');
    difficultySelect = document.createElement('select');
    difficultySelect.className = 'form-select w-auto mx-auto mt-2';
    
    Object.keys(DIFFICULTY_SPEEDS).forEach(level => {
        const option = document.createElement('option');
        option.value = level;
        option.text = level.charAt(0).toUpperCase() + level.slice(1);
        difficultySelect.appendChild(option);
    });
    
    difficultySelect.value = currentDifficulty;
    restartButton.parentNode.insertBefore(difficultySelect, restartButton.nextSibling);
    
    difficultySelect.addEventListener('change', (e) => {
        currentDifficulty = e.target.value;
        if (gameActive) restartGame(ctx);
    });
    
    startPauseButton.addEventListener('click', () => toggleGame(ctx));
    restartButton.addEventListener('click', () => restartGame(ctx));
    document.addEventListener('keydown', handleKeyPress);
    draw(ctx);
}

function handleKeyPress(event) {
    const key = event.key;
    if (key === 'ArrowUp' && direction !== 'down') direction = 'up';
    if (key === 'ArrowDown' && direction !== 'up') direction = 'down';
    if (key === 'ArrowLeft' && direction !== 'right') direction = 'left';
    if (key === 'ArrowRight' && direction !== 'left') direction = 'right';
}

function toggleGame(ctx) {
    if (!gameActive && !isPaused) {
        // Start new game
        startGame(ctx);
        startPauseButton.textContent = 'Pause Game';
        startPauseButton.classList.replace('btn-success', 'btn-warning');
    } else if (gameActive && !isPaused) {
        // Pause game
        clearInterval(gameLoop);
        isPaused = true;
        startPauseButton.textContent = 'Resume Game';
        startPauseButton.classList.replace('btn-warning', 'btn-success');
    } else {
        // Resume game
        gameLoop = setInterval(() => gameStep(ctx), DIFFICULTY_SPEEDS[currentDifficulty]);
        isPaused = false;
        startPauseButton.textContent = 'Pause Game';
        startPauseButton.classList.replace('btn-success', 'btn-warning');
    }
}

function startGame(ctx) {
    if (gameLoop) clearInterval(gameLoop);
    gameActive = true;
    isPaused = false;
    gameLoop = setInterval(() => gameStep(ctx), DIFFICULTY_SPEEDS[currentDifficulty]);
}

function gameStep(ctx) {
    moveSnake();
    if (checkCollision()) {
        endGame();
        return;
    }
    if (snake[0].x === food.x && snake[0].y === food.y) {
        score += 10;
        updateScore();
        snake.push({});
        generateFood();
    }
    draw(ctx);
}

function moveSnake() {
    const head = { x: snake[0].x, y: snake[0].y };
    switch (direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
    }
    snake.unshift(head);
    snake.pop();
}

function checkCollision() {
    const head = snake[0];
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) return true;
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) return true;
    }
    return false;
}

function generateFood() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    food = newFood;
}

function draw(ctx) {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE);

    // Draw snake with gradient color
    const headColor = '#00ff00';
    const tailColor = '#006400';
    snake.forEach((segment, index) => {
        const ratio = index / snake.length;
        const r = parseInt(headColor.slice(1,3), 16) * (1-ratio) + parseInt(tailColor.slice(1,3), 16) * ratio;
        const g = parseInt(headColor.slice(3,5), 16) * (1-ratio) + parseInt(tailColor.slice(3,5), 16) * ratio;
        const b = parseInt(headColor.slice(5,7), 16) * (1-ratio) + parseInt(tailColor.slice(5,7), 16) * ratio;
        ctx.fillStyle = `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
        ctx.fillRect(segment.x * CELL_SIZE, segment.y * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1);
    });

    // Draw food with pulsing effect
    const pulseScale = 1 + 0.1 * Math.sin(Date.now() / 200);
    ctx.fillStyle = '#f00';
    ctx.beginPath();
    ctx.arc(
        food.x * CELL_SIZE + CELL_SIZE/2,
        food.y * CELL_SIZE + CELL_SIZE/2,
        (CELL_SIZE/2 - 1) * pulseScale,
        0, Math.PI * 2
    );
    ctx.fill();

    // Draw scores with responsive positioning and scaling
    const scoreSize = Math.min(20 + score/50, 32);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.font = `${scoreSize}px Arial`;
    const padding = 15;
    const scoreY = padding + scoreSize;
    const highScoreY = scoreY + scoreSize + 5;
    
    // Add glow effect for score
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = score > 0 ? 5 : 0;
    ctx.fillText(`Score: ${score}`, padding, scoreY);
    
    // Reset shadow for high score
    ctx.shadowBlur = 0;
    ctx.font = '20px Arial';
    ctx.fillText(`High Score: ${highScore}`, padding, highScoreY);
}

function updateScore() {
    if (currentScoreElement) {
        currentScoreElement.textContent = score;
    }
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
    }
}

function endGame() {
    clearInterval(gameLoop);
    gameActive = false;
    const canvas = document.getElementById('snakeGame');
    const ctx = canvas.getContext('2d');
    
    // Draw game over screen
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#fff';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvas.width/2, canvas.height/2 - 40);
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, canvas.width/2, canvas.height/2);
    ctx.fillText(`High Score: ${highScore}`, canvas.width/2, canvas.height/2 + 30);
    
    const playAgain = confirm(`Game Over! Your score: ${score}\nHigh Score: ${highScore}\nWould you like to play again?`);
    if (playAgain) {
        restartGame(ctx);
    }
}

function restartGame(ctx) {
    clearInterval(gameLoop);
    snake = [{ x: 10, y: 10 }];
    direction = 'right';
    score = 0;
    gameActive = false;
    isPaused = false;
    updateScore();
    generateFood();
    startPauseButton.textContent = 'Start Game';
    startPauseButton.classList.replace('btn-warning', 'btn-success');
    draw(ctx);
}

function generateFood() {
    food.x = Math.floor(Math.random() * GRID_SIZE);
    food.y = Math.floor(Math.random() * GRID_SIZE);
}

function draw(ctx) {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE);

    // Draw snake with gradient color
    const headColor = '#00ff00';
    const tailColor = '#006400';
    snake.forEach((segment, index) => {
        const ratio = index / snake.length;
        const r = parseInt(headColor.slice(1,3), 16) * (1-ratio) + parseInt(tailColor.slice(1,3), 16) * ratio;
        const g = parseInt(headColor.slice(3,5), 16) * (1-ratio) + parseInt(tailColor.slice(3,5), 16) * ratio;
        const b = parseInt(headColor.slice(5,7), 16) * (1-ratio) + parseInt(tailColor.slice(5,7), 16) * ratio;
        ctx.fillStyle = `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
        ctx.fillRect(segment.x * CELL_SIZE, segment.y * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1);
    });

    // Draw food with pulsing effect
    const pulseScale = 1 + 0.1 * Math.sin(Date.now() / 200);
    ctx.fillStyle = '#f00';
    ctx.beginPath();
    ctx.arc(
        food.x * CELL_SIZE + CELL_SIZE/2,
        food.y * CELL_SIZE + CELL_SIZE/2,
        (CELL_SIZE/2 - 1) * pulseScale,
        0, Math.PI * 2
    );
    ctx.fill();

    // Draw scores with responsive positioning and scaling
    const scoreSize = Math.min(20 + score/50, 32);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.font = `${scoreSize}px Arial`;
    const padding = 15;
    const scoreY = padding + scoreSize;
    const highScoreY = scoreY + scoreSize + 5;
    
    // Add glow effect for score
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = score > 0 ? 5 : 0;
    ctx.fillText(`Score: ${score}`, padding, scoreY);
    
    // Reset shadow for high score
    ctx.shadowBlur = 0;
    ctx.font = '20px Arial';
    ctx.fillText(`High Score: ${highScore}`, padding, highScoreY);
}

function updateScore() {
    if (currentScoreElement) {
        currentScoreElement.textContent = score;
    }
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
    }
}

function restartGame(ctx) {
    clearInterval(gameLoop);
    snake = [{ x: 10, y: 10 }];
    direction = 'right';
    score = 0;
    gameActive = false;
    isPaused = false;
    updateScore();
    generateFood();
    startPauseButton.textContent = 'Start Game';
    startPauseButton.classList.replace('btn-warning', 'btn-success');
    draw(ctx);
}

function endGame() {
    clearInterval(gameLoop);
    gameActive = false;
    const canvas = document.getElementById('snakeGame');
    const ctx = canvas.getContext('2d');
    
    // Draw game over screen
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#fff';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvas.width/2, canvas.height/2 - 40);
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, canvas.width/2, canvas.height/2);
    ctx.fillText(`High Score: ${highScore}`, canvas.width/2, canvas.height/2 + 30);
    
    const playAgain = confirm(`Game Over! Your score: ${score}\nHigh Score: ${highScore}\nWould you like to play again?`);
    if (playAgain) {
        restartGame(ctx);
    }
}