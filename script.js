//Kreiramo canvas i kontekst za crtanje
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const startScreen = document.getElementById('startScreen');
const endScreen = document.getElementById('endScreen');
const finalScore = document.getElementById('finalScore');
const message = document.getElementById('message');

// Definiramo parametre igre
const ballRadius = 2;
const paddleHeight = 5;
const paddleWidth = 25;
let paddleX;

// Pozicija loptice
let x; 
let y;
let dx;  // Horizontalna brzina loptice
let dy; // Vertikalna brzina loptice

// Parametri cigli
const brickRowCount = 7;
const brickColumnCount = 10;
const brickWidth = 20;
const brickHeight = 5;
const brickPadding = 4;
const brickOffsetTop = 20;
const brickOffsetLeft = canvas.width / 2 - (brickColumnCount * (brickWidth + brickPadding)) / 2;

// Bodovi
let score;
let highScore = localStorage.getItem("highScore") || 0;

// Palica kontrolirana tipkovnicom
let rightPressed = false;
let leftPressed = false;

// Generiranje cigli
let bricks;

// Inicijalizacija igre
function initGameVariables() {
    score = 0;
    // Postavljamo početnu poziciju palice
    paddleX = (canvas.width - paddleWidth) / 2;
    // Postavljamo početnu poziciju loptice
    x = canvas.width / 2;
    y = canvas.height - 30;
    dx = 1; // Horizontalna brzina loptice
    dy = -1; // Vertikalna brzina loptice

    // Ponovno generiramo cigle
    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            // Postavljamo status cigle na 1 (vidljiva)
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
}
//Pokretanje igre
function startGame() {
    startScreen.style.display = "none";
    endScreen.style.display = "none";
    initGameVariables();
    draw();
}
//Restart igre
function restartGame() {
    endScreen.style.display = "none";
    initGameVariables();
    draw();
}
//Kraj igre
function gameOver() {
    finalScore.textContent =  `Your Score: ${score}`;
    endScreen.style.display = "flex";
}

// Funkcija za crtanje cigli
function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            // Provjeravamo status cigle
            if (bricks[c][r].status == 1) {
                // Postavljamo poziciju cigle
               let brickX =(c * (brickWidth + brickPadding)) + brickOffsetLeft;
               let brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
                bricks[c][r].x =  brickX;
                bricks[c][r].y = brickY;

                // Definiramo gradijent za cigle
                let gradient = ctx.createLinearGradient(brickX, brickY, brickX + brickWidth, brickY + brickHeight);
                gradient.addColorStop(0, "#0095dd");         
                gradient.addColorStop(1, "rgba(0, 0, 139, 0.8)");

                //Crtamo ciglu
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = gradient;
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function drawPaddle() {
    // Definiramo gradijent za palicu
    let gradient = ctx.createLinearGradient(paddleX, canvas.height - paddleHeight * 2, 
                                            paddleX + paddleWidth, canvas.height - paddleHeight * 2 + paddleHeight);
    gradient.addColorStop(0, "red");                 
    gradient.addColorStop(1, "rgba(139, 0, 0, 0.8)"); 

    // Crtamo palicu
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight * 2, paddleWidth, paddleHeight);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.closePath();
}
//Crtanje loptice
function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.closePath();
}
// Crtanje bodova
function drawScore() {
    ctx.font = "10px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Score: " + score, canvas.width - (canvas.width / 2.5), 13);
    ctx.fillText("High Score: " + highScore, canvas.width - (canvas.width / 4) , 13);
}
// Detekcija sudara
function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            //Ukoliko je u statusu 1, provjeravamo sudar
            if (b.status == 1) {
                // Provjeravamo da li je loptica udarila u ciglu
                if (x >= b.x && x <= b.x + brickWidth && y >= b.y && y <= b.y + brickHeight) {
                    dy = -dy; //mijenjamo smjer loptice
                    b.status = 0; //postavljamo status cigle na 0 (nevidljiva)
                    score++;
                    if (score > highScore) {
                        highScore = score;
                        localStorage.setItem("highScore", highScore);
                    }
                    if (score == brickRowCount * brickColumnCount) {
                        message.textContent = "Congratulations! You won!";
                        gameOver();
                    }
                }
            }
        }
    }
}
// Funkcija za crtanje
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    collisionDetection();
    // Provjeravamo sudar sa zidovima
    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }
    // Provjeravamo sudar sa gornjim zidom
    if (y + dy < ballRadius) {
        dy = -dy;
    //Provjeravamo sudar sa palicom
    } else if (y + dy > canvas.height - ballRadius - paddleHeight) {
        // Ako je loptica udarila u palicu, mijenjamo smjer loptice
        if (x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy;
        } else {
            message.textContent = "Game Over!";
            gameOver();
            return; // Zaustavljamo igru
        }
    }
    //Provjeravamo da li je tipka pritisnuta i pomjeramo palicu
    if (rightPressed && paddleX < canvas.width - paddleWidth / 2) {
        paddleX += 3;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 3;
    }
    //Pomicanje loptice
    x += dx;
    y += dy;
    //Funkcija za animaciju
    requestAnimationFrame(draw);
}

//Dodajemo event listener za tipkovnicu
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
    if (e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = true;
    } else if (e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = false;
    } else if (e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = false;
    }
}