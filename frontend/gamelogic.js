import { api_url } from "./baseurl.js";
const game = new Chess();
let board = null;
let $status = $('#status');
let $fen = $('#fen');
let $pgn = $('#pgn');

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

export function onDragStart(source, piece, position, orientation) {
  console.log("drag start");

  console.log("orientation : ", orientation);

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

export function onDrop(source, target) {
  console.log("drag stopped");
  console.log("game obj : ", game);
  // see if the move is legal
  let move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  });
  console.log("move : ", move);

  // illegal move
  if (move === null) return 'snapback';

  updateStatus();
}

export function onSnapEnd() {
  board.position(game.fen());
}

export function updateStatus() {
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

export function create_config(board_pos, orientation) {
  let config = {
    draggable: true,
    position: board_pos,
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd,
    showNotation: true,
    showErrors: console,
    orientation: orientation
  }
  return config;
}

export function get_page_orientation() {
  const url = window.location.href;
  if (url.includes("white.html")) {
    return "white";
  } else if (url.includes("black.html")) {
    return "black";
  }
}

let page_orientation = get_page_orientation();
let config = create_config('start', page_orientation);
console.log("config : ", config);
board = Chessboard('myBoard', config);
console.log("api url : ", api_url);
updateStatus();

document.getElementById("submitMove").addEventListener("click", () => {
  console.log("submit move");
  submitMove();
});

export function updateGamePage(game_obj) {
  game.load(game_obj.fen);
  board.destroy();
  board = Chessboard('myBoard', create_config(game_obj.fen, page_orientation));
  updateStatus();
}
const eventSource = new EventSource(api_url + '/gameupdatestream');
eventSource.onmessage = function(event) {
    const gameData = JSON.parse(event.data);
    console.log('Received game update:', gameData);
    // Process the received game update, update UI, etc.
    updateGamePage(gameData);
};
