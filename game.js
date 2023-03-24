let popSound = new sound("./sound/pop.mp3");
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

let fontSize = 32;

let currentScene = "game";
let currentGameMode = 1;

const firstPlayerColor = "blue";
const secondPlayerColor = "red";

let playerWinner;

let currentPlayer = firstPlayerColor;
let pressedCell = null;

let CELL_SIZE;
let boardWidth = 11;
let boardHeight = 11;

class Cell {
    constructor(x, y, status, isConnectedToFirstBound = false, isConnectedToSecondBound = false, isLine = false, isPressed = false) {
        this.x = x;
        this.y = y;
        this.status = status;
        this.isLine = isLine;
        if (!isLine) {
            this.isConnectedToFirstBound = isConnectedToFirstBound;
            this.isConnectedToSecondBound = isConnectedToSecondBound;
            this.isPressed = isPressed;
        }
    }
}

let boardMatrix = createBoardMatrix(boardWidth, boardHeight);

boardData = {
    width: 0,
    x: 0,
    y: 0
}

drawCurrentScene();

window.addEventListener('resize', drawCurrentScene);
canvas.addEventListener('click', makeMove);

function checkAndUpdateBoardMatrix(row, col) {
    const xDiff = pressedCell.x - col;
    const yDiff = pressedCell.y - row;
    let isDone = false;

    if (xDiff === -2 && yDiff === 0) {
        isDone = updateBoardMatrix(row, col - 1, row, col - 2);
    } else if (xDiff === 2 && yDiff === 0) {
        isDone = updateBoardMatrix(row, col + 1, row, col + 2);
    } else if (xDiff === 0 && yDiff === -2) {
        isDone = updateBoardMatrix(row - 1, col, row - 2, col);
    } else if (xDiff === 0 && yDiff === 2) {
        isDone = updateBoardMatrix(row + 1, col, row + 2, col);
    }
    return isDone;
}

function updateBoardMatrix(r1, c1, r2, c2) {
    if (boardMatrix[r1][c1].status === 0) {
        boardMatrix[r1][c1].status = currentPlayer;
        boardMatrix[r2][c2].isPressed = false;
        return true;
    } return false;
}

function makeMove() {
    const x = event.clientX - canvas.offsetLeft;
    const y = event.clientY - canvas.offsetTop;

    let row = Math.floor((y - boardData["y"] + boardData["width"] * 0.5) / CELL_SIZE);
    let col = Math.floor((x - boardData["x"] + boardData["width"] * 0.5) / CELL_SIZE);

    if ((row >= 0 && row < boardWidth) && (col >= 0 && col < boardHeight)) {
        if (!boardMatrix[row][col].isLine) {
            if (pressedCell === null && boardMatrix[row][col].status === currentPlayer) {
                // handle first click
                boardMatrix[row][col].isPressed = true;
                pressedCell = boardMatrix[row][col];
                popSound.play();
            } else if (pressedCell === boardMatrix[row][col]) {
                // cancel the first click
                boardMatrix[row][col].isPressed = false;
                pressedCell = null;
            } else if (pressedCell !== null && boardMatrix[row][col].status === currentPlayer) {
                // if player make the right move - handle it
                if (checkAndUpdateBoardMatrix(row, col)) {
                    boardMatrix[row][col].isConnectedToFirstBound = pressedCell.isConnectedToFirstBound || boardMatrix[row][col].isConnectedToFirstBound;
                    boardMatrix[pressedCell.y][pressedCell.x].isConnectedToFirstBound = boardMatrix[row][col].isConnectedToFirstBound;
                    boardMatrix[row][col].isConnectedToSecondBound = pressedCell.isConnectedToSecondBound || boardMatrix[row][col].isConnectedToSecondBound;
                    boardMatrix[pressedCell.y][pressedCell.x].isConnectedToSecondBound = boardMatrix[row][col].isConnectedToSecondBound;

                    let visited = [];
                    let isConnectedToFirstBound = false;
                    let isConnectedToSecondBound = false;

                    checkNeighbors(boardMatrix[row][col]);
                    function checkNeighbors(cell) {
                        // check if neighbors connected to bounds
                        cellDirs = [[cell.x - 1, cell.x - 2, cell.y, cell.y], [cell.x + 1, cell.x + 2, cell.y, cell.y], [cell.x, cell.x, cell.y - 1, cell.y - 2], [cell.x, cell.x, cell.y + 1, cell.y + 2]]

                        cellDirs.forEach((dir) => {
                            const x = dir[0];
                            const y = dir[2];
                            const x2 = dir[1];
                            const y2 = dir[3];

                            if ((x < boardWidth && y < boardHeight) && (x >= 0 && y >= 0) && boardMatrix[y][x].status === currentPlayer && !visited.includes(boardMatrix[y2][x2])) {
                                if (boardMatrix[y2][x2].isConnectedToFirstBound) {
                                    isConnectedToFirstBound = true;
                                }
                                if (boardMatrix[y2][x2].isConnectedToSecondBound) {
                                    isConnectedToSecondBound = true;
                                }
                                visited.push(boardMatrix[y2][x2]);
                                console.log(x2, y2)
                                checkNeighbors(boardMatrix[y2][x2]);
                            }
                        });
                    }

                    pressedCell = null;

                    if ((boardMatrix[row][col].isConnectedToFirstBound && boardMatrix[row][col].isConnectedToSecondBound) || (isConnectedToFirstBound && isConnectedToSecondBound)) {
                        playerWinner = currentPlayer;
                        winPlayer();
                    } else {
                        switchPlayer();
                    }
                }
            }
        }
    }
    drawCurrentScene();
}



function createBoardMatrix(width, height) {
    let board = [];
    // set Cells on the boardMatrix
    for (let i = 0; i < height; i++) {
        let row = [];

        for (let j = 0; j < width; j++) {
            let cell;
            if ((i % 2) !== 0) {
                if ((j % 2) === 0) {
                    cell = new Cell(j, i, secondPlayerColor);
                } else {
                    cell = new Cell(j, i, 0, false, false, true);
                }
            } else {
                if ((j % 2) !== 0) {
                    cell = new Cell(j, i, firstPlayerColor);
                } else {
                    cell = new Cell(j, i, 0, false, false, true);
                }
            }
            row.push(cell);
        }
        board.push(row);
    }
    // before start set the based connected cells for both players
    for (let j = 0; j < width; j++) {
        if (!board[0][j].isLine) {
            board[0][j].isConnectedToFirstBound = true;
        } else if (j !== 0 && j !== (width - 1)) {
            board[0][j].status = firstPlayerColor;
        }
    }
    for (let j = 0; j < width; j++) {
        if (!board[width - 1][j].isLine) {
            board[width - 1][j].isConnectedToSecondBound = true;
        } else if (j !== 0 && j !== (width - 1)) {
            board[width - 1][j].status = firstPlayerColor;
        }
    }

    for (let i = 0; i < height; i++) {
        if (!board[i][0].isLine) {
            board[i][0].isConnectedToFirstBound = true;
            board[i][height - 1].isConnectedToSecondBound = true;
        } else if (i !== 0 && i !== (height - 1)) {
            board[i][0].status = secondPlayerColor;
            board[i][height - 1].status = secondPlayerColor;
        }
    }
    return board;
}

function drawBoard(boardMatrix, x, y, width) {
    CELL_SIZE = Math.floor(width / boardMatrix[0].length)
    const delta = CELL_SIZE * ((boardWidth - 1) / 2)
    let dX = x - delta
    let dY = y - delta

    for (let row = 0; row < boardMatrix.length; row++) {
        for (let col = 0; col < boardMatrix[0].length; col++) {
            let currentColor;
            if (boardMatrix[row][col].status !== 0) {
                currentColor = boardMatrix[row][col].status;
                if (boardMatrix[row][col].isLine) {
                    const isEvenCol = col % 2 === 0;
                    const isFirstPlayer = currentColor === firstPlayerColor;

                    if ((isFirstPlayer && isEvenCol) || (!isFirstPlayer && !isEvenCol)) {
                        // draw horizontal line
                        drawLine(ctx, (boardMatrix[row][col].x - 1) * CELL_SIZE + dX, boardMatrix[row][col].y * CELL_SIZE + dY,
                            (boardMatrix[row][col].x + 1) * CELL_SIZE + dX, boardMatrix[row][col].y * CELL_SIZE + dY, CELL_SIZE * 0.2, currentColor)
                    }
                    else {
                        // draw vertical line
                        drawLine(ctx, boardMatrix[row][col].x * CELL_SIZE + dX, (boardMatrix[row][col].y - 1) * CELL_SIZE + dY,
                            boardMatrix[row][col].x * CELL_SIZE + dX, (boardMatrix[row][col].y + 1) * CELL_SIZE + dY, CELL_SIZE * 0.2, currentColor)
                    }
                } else {
                    const circleSize = boardMatrix[row][col].isPressed ? CELL_SIZE * 0.2 : CELL_SIZE * 0.3;
                    drawCircle(ctx, dX + CELL_SIZE * col, dY + CELL_SIZE * row, circleSize, currentColor)

                }
            }
        }
    }
}

function drawCircle(ctx, x, y, radius, fillColor) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = fillColor;
    ctx.fill();
}

function drawLine(ctx, startX, startY, endX, endY, lineWidth, strokeColor) {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = strokeColor;
    ctx.stroke();
}

function drawText(ctx, text, x, y, font, color) {
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
}

function switchPlayer() {
    currentPlayer = (currentPlayer === firstPlayerColor) ? secondPlayerColor : firstPlayerColor;
}

function winPlayer() {
    canvas.removeEventListener('click', makeMove);
    currentScene = "gameWin";
}

function drawGrid(cellSize, cellColor, lineWidth, width, height) {
    ctx.strokeStyle = cellColor;
    ctx.lineWidth = lineWidth;

    for (var x = 0; x <= width; x += cellSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }

    for (var y = 0; y <= height; y += cellSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
}

function drawSceneGame() {
    boardData["width"] = Math.min(canvas.width, canvas.height) * 0.95;
    boardData["x"] = canvas.width / 2;
    boardData["y"] = canvas.height / 2;

    drawBoard(boardMatrix, boardData["x"], boardData["y"], boardData["width"])

    drawText(ctx, `Режим: на двоих`, canvas.width * 0.01, fontSize, `bold ${fontSize}px sans-serif`, currentPlayer)
    drawText(ctx, `Ход игрока: ${currentPlayer}`, canvas.width * 0.01, fontSize * 2, `bold ${fontSize}px sans-serif`, currentPlayer)
    drawText(ctx, "Подсказка: ", canvas.width * 0.01, canvas.height - fontSize * 3, `${fontSize * 0.85}px sans-serif`, currentPlayer)
    drawText(ctx, "Соедини противоположные", canvas.width * 0.01, canvas.height - fontSize * 2, `${fontSize * 0.85}px sans-serif`, currentPlayer)
    drawText(ctx, "стороны своего цвета, чтобы победить.", canvas.width * 0.01, canvas.height - fontSize, `${fontSize * 0.85}px sans-serif`, currentPlayer)
}

function drawSceneGameWin() {
    drawSceneGame();
    drawText(ctx, `Победил игрок: ${playerWinner}`, canvas.width * 0.01, fontSize * 3, `bold ${fontSize}px sans-serif`, playerWinner);
}

function drawCurrentScene() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    fontSize = Math.floor(Math.max(canvas.width, canvas.height) * 0.02);

    // draw background color
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid(40, "#E0E0E0", 1, canvas.width, canvas.height);

    // draw current scene
    switch (currentScene) {
        case 'game':
            drawSceneGame();
            break;
        case 'gameWin':
            drawSceneGameWin();
            break;
        default:
            console.log('Scene is not exist');
    }
}

function startGame(gameMode = null) {
    if (gameMode === null) {
        gameMode = currentGameMode;
    }
    switch (gameMode) {
        case 1: // Two players
            currentScene = 'game';
            boardMatrix = createBoardMatrix(boardWidth, boardHeight);
            currentPlayer = (Math.floor(Math.random() * 2) === 1) ? firstPlayerColor : secondPlayerColor;
            pressedCell = null;
            drawCurrentScene();
            break;
        case 2: // Computer
            currentScene = 'game';
            boardMatrix = createBoardMatrix(boardWidth, boardHeight);
            currentPlayer = (Math.floor(Math.random() * 2) === 1) ? firstPlayerColor : secondPlayerColor;
            pressedCell = null;
            drawCurrentScene();
            break;
        default:
            console.log('Gamemode is not exist');
    }
    canvas.removeEventListener('click', makeMove);
    canvas.addEventListener('click', makeMove);
    hideBlock2()
}

function isPortrait() {
    return canvas.width < canvas.height;
}

function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    this.sound.volume = 0.3;
    document.body.appendChild(this.sound);
    this.play = function () {
        this.sound.play();
    }
    this.stop = function () {
        this.sound.pause();
    }
}