import { api_url } from "./baseurl.js";

let $status = $('#status');
let $fen = $('#fen');
let $pgn = $('#pgn');
let boardObjects = {};

export async function getGame() {
  try {
    const response = await fetch(api_url + '/getgame', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        gamecode: localStorage.getItem('gamecode')
      })
    });
    if (!response.ok) {
      throw new Error('Failed to get game');
    }
    const data = await response.json();
    console.log('Success:', data);
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}

export async function submitMove() {
  const orientation = get_page_orientation();
  const game_data = await getGame();
  console.log("consensus data : ", game_data.consensus);
  if (!game_data.consensus && orientation === "white") {
    console.log("reach consensus first");
    alert("reach consensus first, suggest moves first");
    location.reload();
    return;
  } else {
    console.log("consensus reached. move can be made");
  }
  try {
    const response = await fetch(api_url + '/updategame', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        gamecode: localStorage.getItem('gamecode'),
        pgn: game.pgn(),
        fen: game.fen()
      })
    });
    if (!response.ok) {
      throw new Error('Failed to update game');
    }
    const data = await response.json();
    console.log('Success:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

export function onDragStart(game, boardId, source, piece, position, orientation) {
  console.log("games", game);
  console.log("drag start");
  console.log("board: ")
  console.log("orientation : ", orientation);
  console.log("game object : ", game);

  // do not pick up pieces if the game is over
  if (game.game_over()) return false;

  //only pick up pieces for the side to move
  if ((orientation === 'black' && piece.search(/^w/) !== -1) || (orientation === 'white' && piece.search(/^b/) !== -1)) {
    return false;
  }

  // only pick up pieces for the side to move
  if ((game.turn() === 'w' && piece.search(/^b/) !== -1) || (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
    return false;
  }
}

export function onDrop(game, boardId, source, target) {
  console.log("drag stopped");
  // see if the move is legal
  let move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  });
  console.log("move : ", move);

  // illegal move
  if (move === null) return 'snapback';

  updateStatus(game, boardId);
}

export function onSnapEnd(game, boardId) {
  const board = boardObjects[boardId];
  board.position(game.fen());
}

export function updateStatus(game, boardId) {
  let status = '';
  let moveColor = 'White';
  if (game.turn() === 'b') {
    moveColor = 'Black';
  }

  if (game.in_checkmate()) {
    status = 'Game over, ' + moveColor + ' is in checkmate.';
  } else if (game.in_draw()) {
    status = 'Game over, drawn position';
  } else {
    status = moveColor + ' to move';
    if (game.in_check()) {
      status += ', ' + moveColor + ' is in check';
    }
  }

  $status.html(status);
  $fen.html(game.fen());
  $pgn.html(game.pgn());
}

export function create_config(game, boardId, board_pos, orientation) {
  return {
    draggable: true,
    position: board_pos,
    onDragStart: onDragStart.bind(null, game, boardId),
    onDrop: onDrop.bind(null, game, boardId),
    onSnapEnd: onSnapEnd.bind(null, game, boardId),
    showNotation: true,
    showErrors: 'console',
    orientation: orientation
  };
}

export function get_page_orientation() {
  const url = window.location.href;
  if (url.includes("white.html")) {
    return "white";
  } else if (url.includes("black.html")) {
    return "black";
  }
}
// Function to initialize board
export function initializeBoard(boardId, board_pos="start", orientation) {
  // Create a new game instance
  const game = new Chess();
  
  // Create board config based on orientation
  const config = create_config(game, boardId, board_pos, orientation);
  
  // Create the board and store it in the boards array
  const board = Chessboard(boardId, config);
  // store board in boardObjects
  boardObjects[boardId] = board;
  
  return { game, board };
}

document.getElementById("submitMove").addEventListener("click", () => {
  console.log("submit move");
  submitMove();
});

async function suggestionTextupdate(whiteMoves, whiteAssistMoves) {
  let suggestionText = "suggested moves from white team are " + whiteMoves + "\n and suggested moves from white assist team are " + whiteAssistMoves;
  document.getElementById("suggestionBox").innerHTML = suggestionText;
  console.log("suggestion text : ", suggestionText);
}

export function updateGamePage(game_obj) {
  game.load(game_obj.fen);
  board.destroy();
  board = Chessboard('myBoard', create_config(game_obj.fen, page_orientation));
  updateStatus();
  localStorage.setItem("game_obj", JSON.stringify(game_obj));
  console.log("updateGamepage : ", game_obj);
  if(page_orientation == "white"){
    suggestionTextupdate(game_obj.white.moves, game_obj.whiteAssist.moves);
  }
}

