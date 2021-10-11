(function () {

    const boardWidth = 10;
    const boardHeight = 20;


    let pieces = {
        L: [
            [1, 0],
            [1, 0],
            [1, 1]
        ],
        J: [
            [0, 1],
            [0, 1],
            [1, 1]
        ],
        O: [
            [1, 1],
            [1, 1]
        ],
        T: [
            [0, 0, 0],
            [0, 1, 0],
            [1, 1, 1]
        ],
        S: [
            [0, 1, 1],
            [1, 1, 0]
        ],
        Z: [
            [1, 1, 0],
            [0, 1, 1]
        ],
        I: [
            [0, 1, 0],
            [0, 1, 0],
            [0, 1, 0],
            [0, 1, 0]
        ]
    };

    let colours = {
        L: 'orange',
        J: 'blue',
        O: 'white',
        T: 'purple',
        S: 'cyan',
        Z: 'red',
        I: 'green'
    };

    let speed = 1;
    let board = [];
    let boardCanvas;
    let horizontalScale;
    let verticalScale;

    let currentPiece = {
        positionX: null,
        positionY: null,
        piece: null
    };


    /**
     * Clears the board matrix
     *
     */
    const clearBoard = () => {
        board = [];
        for (let y = 0; y < boardHeight; y++) {
            board[y] = new Array(boardWidth).fill(0);
        }
    };


    /**
     * Draws any matrix on any canvas. An X and Y offsets can be provided
     *
     * @param canvas
     * @param matrix
     * @param clear
     * @param offsetX
     * @param offsetY
     */
    const draw = (canvas, matrix, clear, offsetX, offsetY) => {

        if (canvas.getContext) {
            let ctx = canvas.getContext('2d');

            if (clear) {
                ctx.clearRect(0, 0, boardWidth * horizontalScale, boardHeight * horizontalScale);
            }

            for (let y = 0; y < matrix.length; y++) {
                let row = matrix[y];

                for (let x = 0; x < row.length; x++) {
                    if (row[x] != 0) {
                        ctx.fillStyle = colours[row[x]];
                        ctx.fillRect((x + offsetX) * horizontalScale, (y + offsetY) * verticalScale, horizontalScale - 1, verticalScale - 1);
                    }
                }
            }
        }
    };

    /**
     * Tests if a piece can be moved into a given position or into its default position
     *
     * @param positionX
     * @param positionY
     * @returns {boolean}
     */
    const canPlaceCurrentPiece = (positionX, positionY) => {
        positionX = positionX || currentPiece.positionX;
        positionY = positionY || currentPiece.positionY;
        return canPlacePiece(currentPiece.piece, positionX, positionY);
    };

    /**
     * Tests if a piece can be placed on the board
     *
     * @param positionX
     * @param positionY
     * @returns {boolean}
     */
    const canPlacePiece = (piece, positionX, positionY) => {
        for (let y = 0; y < piece.length; y++) {
            for (let x = 0; x < piece[y].length; x++) {
                if (piece[y][x] != 0) {
                    let finalPositionX = positionX + x;
                    let finalPositionY = positionY + y;
                    if (finalPositionY < 0
                        || finalPositionX < 0
                        || finalPositionY >= board.length
                        || finalPositionX >= board[finalPositionY].length
                        || board[finalPositionY][finalPositionX] != 0
                    ) {
                        return false;
                    }
                }
            }
        }
        return true;
    };

    /**
     * Tests if the current piece can be moved into another position. If it can
     * be moved, it updates the position and redraws the board
     *
     * @param positionX
     * @param positionY
     */
    const moveCurrentPiece = (positionX, positionY) => {
        if (canPlaceCurrentPiece(positionX, positionY)) {
            currentPiece.positionX = positionX;
            currentPiece.positionY = positionY;
            draw(boardCanvas, board, true, 0, 0);
            draw(boardCanvas, currentPiece.piece, false, currentPiece.positionX, currentPiece.positionY);
        }
    };

    /**
     * Takes the current pieces and drops it one time
     */
    const dropCurrentPiece = () => {
        let nextPieceTimer = setTimeout(() => {
            if (canPlaceCurrentPiece()) {
                draw(boardCanvas, board, true, 0, 0);
                draw(boardCanvas, currentPiece.piece, false, currentPiece.positionX, currentPiece.positionY);
                currentPiece.positionY++;
                dropCurrentPiece();
            } else {
                clearTimeout(nextPieceTimer);
                for (let y = 0; y < currentPiece.piece.length; y++) {
                    for (let x = 0; x < currentPiece.piece[y].length; x++) {
                        if (currentPiece.piece[y][x] != 0) {
                            board[currentPiece.positionY - 1 + y][currentPiece.positionX + x] = currentPiece.pieceType;
                        }
                    }
                }
                nextPiece();
            }
        }, 300);
    };

    /**
     * Ends the game
     */
    const gameOver = () => {

    };

    /**
     * Check to see if there are complete rows in the board. If there are complete rows,
     * it clears the row and drops everything down
     */
    const checkAndClearRows = () => {
        let rowsToRemove = [];
        for (let y = 0; y < boardHeight; y++) {
            let completeRow = true;

            for (let x = 0; x < boardWidth; x++) {
                if (board[y][x] == 0) {
                    completeRow = false;
                    break;
                }
            }


            if (completeRow) {
                rowsToRemove.push(y);
            }
        }

        rowsToRemove.forEach(y => {
            board.splice(y, 1);
            board.unshift(new Array(boardWidth).fill(0));
        })
    };

    /**
     * Tries to put the next piece in the board and selects a new one to
     * become the next piece after the current one is placed
     */
    const nextPiece = () => {
        let names = Object.keys(pieces);
        let p = names[Math.floor(Math.random() * names.length)];
        let piece = pieces[p];
        currentPiece.positionX = 4;
        currentPiece.positionY = 0;
        currentPiece.piece = piece.map(r => r.map(v => v ? p : v));
        currentPiece.pieceType = p;

        // check the board for complete rows
        checkAndClearRows();

        // see if we can place the next piece
        if (canPlaceCurrentPiece()) {
            dropCurrentPiece();
        } else {
            gameOver();
        }
    };

    /**
     * Clears the board, selects the first piece to enter the board
     * and selects the next piece that will enter the board
     */
    const startGame = () => {
        clearBoard();
        nextPiece();
    };

    /**
     * Rotates the current piece
     */
    const rotateCurrentPiece = () => {

        let newPiece = currentPiece.piece[0].map((val, index) => currentPiece.piece.map(row => row[index]).reverse());

        if (canPlacePiece(newPiece, currentPiece.positionX, currentPiece.positionY)) {
            currentPiece.piece = newPiece;
            draw(boardCanvas, board, true, 0, 0);
            draw(boardCanvas, currentPiece.piece, false, currentPiece.positionX, currentPiece.positionY);
        }
    };

    /**
     * Capture the Key Down event so that we can see which keyboard key is being pressed
     * and decide which way we need to move the current piece
     *
     * @param event
     */
    window.onkeydown = (event) => {
        if (currentPiece.piece) {
            switch (event.key) {
                case 'ArrowDown':
                    moveCurrentPiece(currentPiece.positionX, currentPiece.positionY + 1);
                    break;
                case 'ArrowUp':
                    rotateCurrentPiece();
                    break;
                case 'ArrowLeft':
                    moveCurrentPiece(currentPiece.positionX - 1, currentPiece.positionY);
                    break;
                case 'ArrowRight':
                    moveCurrentPiece(currentPiece.positionX + 1, currentPiece.positionY);
                    break;
            }
        }
    };

    /**
     * When the page loads it starts the game automatically
     */
    window.onload = () => {
        boardCanvas = document.getElementById('board');
        horizontalScale = boardCanvas.getAttribute('width') / boardWidth;
        verticalScale = boardCanvas.getAttribute('height') / boardHeight;
        startGame();
    }
})();