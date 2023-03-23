let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

let currentScene = "game";

const firstPlayerColor = "blue";
const secondPlayerColor = "red";

let playerWinner;

let currentPlayer = firstPlayerColor;
let pressedCell = null;

let CELL_SIZE;
let boardWidth = 11;
let boardHeight = 11;

let boardMatrix = createBoardMatrix(boardWidth, boardHeight);

boardData = {
    width: 0,
    x: 0,
    y: 0
}

drawCurrentScene();

window.addEventListener('resize', drawCurrentScene);
canvas.addEventListener('click', makeMove);

// NEW VERSION
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

// NEW VERSION
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
    // FIX BUG: если ставить точки "в воздухе" то соединение с границей не засчитывается.
    console.log(boardMatrix[row][col].isConnectedToFirstBound, boardMatrix[row][col].isConnectedToSecondBound)
    if ((row >= 0 && row < boardWidth) && (col >= 0 && col < boardHeight)) {
        if (!boardMatrix[row][col].isLine) {
            if (pressedCell === null && boardMatrix[row][col].status === currentPlayer) {
                // handle first click
                boardMatrix[row][col].isPressed = true;
                pressedCell = boardMatrix[row][col];
            } else if (pressedCell === boardMatrix[row][col]) {
                // cancel the first click
                boardMatrix[row][col].isPressed = false;
                pressedCell = null;
            } else if (pressedCell !== null && boardMatrix[row][col].status === currentPlayer) {
                // OLD VERSION
               /* let isDone = false;
                if ((pressedCell.x - col) === -2 && pressedCell.y === row) {
                    if (boardMatrix[row][col - 1].status === 0) {
                        boardMatrix[row][col - 1].status = currentPlayer;
                        boardMatrix[row][col - 2].isPressed = false;
                        isDone = true;
                    }
                } else if ((pressedCell.x - col) === 2 && pressedCell.y === row) {
                    if (boardMatrix[row][col + 1].status === 0) {
                        boardMatrix[row][col + 1].status = currentPlayer;
                        boardMatrix[row][col + 2].isPressed = false;
                        isDone = true;
                    }
                } else if (pressedCell.x === col && (pressedCell.y - row) === -2) {
                    if (boardMatrix[row - 1][col].status === 0) {
                        boardMatrix[row - 1][col].status = currentPlayer;
                        boardMatrix[row - 2][col].isPressed = false;
                        isDone = true;
                    }
                } else if (pressedCell.x === col && (pressedCell.y - row) === 2) {
                    if (boardMatrix[row + 1][col].status === 0) {
                        boardMatrix[row + 1][col].status = currentPlayer;
                        boardMatrix[row + 2][col].isPressed = false;
                        isDone = true;
                    }
                }*/

                // NEW VERSION
                // if player make the right move - handle it
                if (checkAndUpdateBoardMatrix(row, col)) {
                    boardMatrix[row][col].isConnectedToFirstBound = pressedCell.isConnectedToFirstBound || boardMatrix[row][col].isConnectedToFirstBound;
                    boardMatrix[pressedCell.y][pressedCell.x].isConnectedToFirstBound = boardMatrix[row][col].isConnectedToFirstBound;
                    boardMatrix[row][col].isConnectedToSecondBound = pressedCell.isConnectedToSecondBound || boardMatrix[row][col].isConnectedToSecondBound;
                    boardMatrix[pressedCell.y][pressedCell.x].isConnectedToSecondBound = boardMatrix[row][col].isConnectedToSecondBound;

                    pressedCell = null;

                    if (boardMatrix[row][col].isConnectedToFirstBound && boardMatrix[row][col].isConnectedToSecondBound) {
                        playerWinner = currentPlayer;
                        winPlayer();
                    }
                    switchPlayer();
                }
            }
        }
    }
    drawCurrentScene();
}

function Cell(x, y, status, isConnectedToFirstBound = false, isConnectedToSecondBound = false, isLine = false, isPressed = false) {
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
                    // OLD VERSION
                    /*if (currentColor === firstPlayerColor) {
                        if (col % 2 === 0) {
                            drawLine(ctx, (boardMatrix[row][col].x - 1) * CELL_SIZE + dX, boardMatrix[row][col].y * CELL_SIZE + dY, (boardMatrix[row][col].x + 1) * CELL_SIZE + dX, boardMatrix[row][col].y * CELL_SIZE + dY, CELL_SIZE * 0.2, currentColor)
                        } else {
                            drawLine(ctx, boardMatrix[row][col].x * CELL_SIZE + dX, (boardMatrix[row][col].y - 1) * CELL_SIZE + dY, boardMatrix[row][col].x * CELL_SIZE + dX, (boardMatrix[row][col].y + 1) * CELL_SIZE + dY, CELL_SIZE * 0.2, currentColor)
                        }
                    } else {
                        if (col % 2 !== 0) {
                            drawLine(ctx, (boardMatrix[row][col].x - 1) * CELL_SIZE + dX, boardMatrix[row][col].y * CELL_SIZE + dY, (boardMatrix[row][col].x + 1) * CELL_SIZE + dX, boardMatrix[row][col].y * CELL_SIZE + dY, CELL_SIZE * 0.2, currentColor)
                        } else {
                            drawLine(ctx, boardMatrix[row][col].x * CELL_SIZE + dX, (boardMatrix[row][col].y - 1) * CELL_SIZE + dY, boardMatrix[row][col].x * CELL_SIZE + dX, (boardMatrix[row][col].y + 1) * CELL_SIZE + dY, CELL_SIZE * 0.2, currentColor)
                        }
                    }*/
                } else {
                    const circleSize = boardMatrix[row][col].isPressed ? CELL_SIZE * 0.2 : CELL_SIZE * 0.3;
                    drawCircle(ctx, dX + CELL_SIZE * col, dY + CELL_SIZE * row, circleSize, currentColor)
                    // OLD VERSION
                    /*if (boardMatrix[row][col].isPressed) {
                        drawCircle(ctx, dX + CELL_SIZE * col, dY + CELL_SIZE * row, CELL_SIZE * 0.2, currentColor)
                    } else {
                        drawCircle(ctx, dX + CELL_SIZE * col, dY + CELL_SIZE * row, CELL_SIZE * 0.3, currentColor)
                    }*/
                    
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

function drawSquare(ctx, x, y, width, height, radius, fillColor) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();
}

function switchPlayer() {
    currentPlayer = (currentPlayer === firstPlayerColor) ? secondPlayerColor : firstPlayerColor;
}

function winPlayer() {
    canvas.removeEventListener('click', makeMove);
    currentScene = "gameWin";
}

function drawSceneGame() {
    boardData["width"] = Math.min(canvas.width, canvas.height) * 0.8;
    boardData["x"] = canvas.width / 2;
    boardData["y"] = canvas.height / 2;

    drawBoard(boardMatrix, boardData["x"], boardData["y"], boardData["width"])

    if (isPortrait()) {
        drawSquare(ctx, 0, canvas.height * 0.8, canvas.width, canvas.height * 0.2, 10, 'grey')
    } else {
        drawSquare(ctx, 0, canvas.height * 0.3, 100, canvas.height * 0.4, 10, 'grey')
    }
    
    drawText(ctx, `Ход игрока: ${currentPlayer}`, 30, 30, "bold 30px sans-serif", currentPlayer)
}

function drawSceneGameWin() {
    drawSceneGame();
    drawText(ctx, `Победил игрок: ${playerWinner}`, 30, 100, "bold 30px sans-serif", playerWinner);
}

function drawCurrentScene() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // draw background color
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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

function isPortrait() {
    return canvas.width < canvas.height;
}