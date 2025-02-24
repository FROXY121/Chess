document.addEventListener("DOMContentLoaded", () => {
  const board = document.querySelector(".chessBoard");
  let selectedSquare = null;
  let turn = "white"; 
  let isVsAI = false; 

  let whiteKingCaptured = false;
  let blackKingCaptured = false;

  const directions = {
    pawn: [[1, 0], [2, 0], [1, 1], [1, -1]],
    rook: [[1, 0], [-1, 0], [0, 1], [0, -1]],
    knight: [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]],
    bishop: [[1, 1], [1, -1], [-1, 1], [-1, -1]],
    queen: [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]],
    king: [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]],
  };

  function initializeGameOptions() {
    const gameOptions = document.createElement("div");
    gameOptions.className = "game-options";

    const vsHumanButton = document.createElement("button");
    vsHumanButton.textContent = "Play vs Human";
    vsHumanButton.addEventListener("click", () => startGame(false));

    const vsAIButton = document.createElement("button");
    vsAIButton.textContent = "Play vs AI";
    vsAIButton.addEventListener("click", () => startGame(true));

    gameOptions.appendChild(vsHumanButton);
    gameOptions.appendChild(vsAIButton);
    document.body.insertBefore(gameOptions, board);
  }

  function startGame(vsAI) {
    isVsAI = vsAI;
    document.querySelector(".game-options").remove();
    initializeBoard();
  }

  function initializeBoard() {
    const squares = Array.from(board.children);
    squares.forEach((square) => {
      square.addEventListener("click", () => handleSquareClick(square));
    });
  }

  function handleSquareClick(square) {
    if (isVsAI && turn === "black") return; // AI's turn

    const piece = square.querySelector(".piece");

    if (!selectedSquare && piece && piece.getAttribute("color") === turn) {
      selectSquare(square);
      highlightLegalMoves(square);
      return;
    }

    if (selectedSquare && square.classList.contains("highlight")) {
      const movingPiece = selectedSquare.querySelector(".piece");
      if (movingPiece) {
        movePiece(movingPiece, square);
        if (isKingCaptured()) {
          alert(`${turn === "white" ? "White" : "Black"} wins! The opponent's king has been captured.`);
          resetGame();
          return;
        }

        deselectSquare();
        if (isGameOver()) {
          alert(`${turn === "white" ? "Black" : "White"} wins!`);
          resetGame();
        } else {
          changeTurn();
          if (isVsAI && turn === "black") aiMove(); 
        }
      }
      return;
    }

    if (selectedSquare === square) {
      deselectSquare();
    }
  }

  function selectSquare(square) {
    selectedSquare = square;
    square.classList.add("selected");
  }

  function deselectSquare() {
    clearHighlights();
    if (selectedSquare) {
      selectedSquare.classList.remove("selected");
      selectedSquare = null;
    }
  }

  function movePiece(piece, targetSquare) {
    const targetPiece = targetSquare.querySelector(".piece");
    if (targetPiece) {
      targetPiece.remove();
      if (targetPiece.classList.contains("king")) {
        if (targetPiece.getAttribute("color") === "white") {
          whiteKingCaptured = true;
        } else {
          blackKingCaptured = true;
        }
      }
    }
    targetSquare.appendChild(piece);
  }

  function changeTurn() {
    turn = turn === "white" ? "black" : "white";
    if (turn === "white") {
      alert("White's turn!");
    }
  }

  function highlightLegalMoves(square) {
    const piece = square.querySelector(".piece");
    if (!piece) return;

    const pieceType = piece.classList[1];
    const color = piece.getAttribute("color");
    const squareIndex = Array.from(board.children).indexOf(square);
    const [row, col] = [Math.floor(squareIndex / 8), squareIndex % 8];

    const moves = calculateMoves(pieceType, color, row, col);

    moves.forEach(([r, c]) => {
      const targetIndex = r * 8 + c;
      const targetSquare = board.children[targetIndex];
      if (targetSquare) {
        targetSquare.classList.add("highlight");
      }
    });
  }

  function calculateMoves(type, color, row, col) {
    const moves = [];
    const dirs = directions[type];

    if (type === "pawn") {
      const direction = color === "white" ? -1 : 1;
      const startRow = color === "white" ? 6 : 1;

      if (isValidSquare(row + direction, col) && isEmptySquare(row + direction, col)) {
        moves.push([row + direction, col]);
      }

      if (
        row === startRow &&
        isValidSquare(row + 2 * direction, col) &&
        isEmptySquare(row + direction, col) &&
        isEmptySquare(row + 2 * direction, col)
      ) {
        moves.push([row + 2 * direction, col]);
      }

      [[row + direction, col - 1], [row + direction, col + 1]].forEach(([r, c]) => {
        if (isValidSquare(r, c) && isEnemySquare(r, c, color)) {
          moves.push([r, c]);
        }
      });
    } else {
      dirs.forEach(([dr, dc]) => {
        for (let i = 1; i <= (type === "king" ? 1 : 8); i++) {
          const [r, c] = [row + dr * i, col + dc * i];
          if (!isValidSquare(r, c)) break;

          if (isEmptySquare(r, c)) {
            moves.push([r, c]);
          } else if (isEnemySquare(r, c, color)) {
            moves.push([r, c]);
            break;
          } else {
            break;
          }
        }
      });
    }

    return moves;
  }

  function isValidSquare(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
  }

  function isEmptySquare(row, col) {
    const index = row * 8 + col;
    const square = board.children[index];
    return square && !square.querySelector(".piece");
  }

  function isEnemySquare(row, col, color) {
    const index = row * 8 + col;
    const square = board.children[index];
    const piece = square ? square.querySelector(".piece") : null;
    return piece && piece.getAttribute("color") !== color;
  }

  function clearHighlights() {
    Array.from(board.children).forEach((square) => {
      square.classList.remove("highlight");
    });
  }

  function aiMove() {
    const allMoves = getAllMoves("black");
    if (allMoves.length === 0) {
      alert("White wins! Checkmate!");
      resetGame();
      return;
    }

    const bestMove = allMoves[Math.floor(Math.random() * allMoves.length)]; // Random move for simplicity
    const [fromIndex, toIndex] = bestMove;
    const fromSquare = board.children[fromIndex];
    const toSquare = board.children[toIndex];
    const piece = fromSquare.querySelector(".piece");

    movePiece(piece, toSquare);
    if (isKingCaptured()) {
      alert(`${turn === "white" ? "Black" : "White"} wins! The opponent's king has been captured.`);
      resetGame();
    } else {
      changeTurn();
    }
  }

  function isKingCaptured() {
    return whiteKingCaptured || blackKingCaptured;
  }

  function isGameOver() {
    const allMoves = getAllMoves(turn);
    return allMoves.length === 0;
  }

  function resetGame() {
    whiteKingCaptured = false;
    blackKingCaptured = false;
    board.innerHTML = ""; 
    initializeGameOptions(); 
  }

  function getAllMoves(color) {
    const allMoves = [];
    Array.from(board.children).forEach((square, index) => {
      const piece = square.querySelector(".piece");
      if (piece && piece.getAttribute("color") === color) {
        const pieceType = piece.classList[1];
        const [row, col] = [Math.floor(index / 8), index % 8];
        const moves = calculateMoves(pieceType, color, row, col);
        moves.forEach(([r, c]) => {
          const toIndex = r * 8 + c;
          allMoves.push([index, toIndex]);
        });
      }
    });
    return allMoves;
  }

  initializeGameOptions();
});
