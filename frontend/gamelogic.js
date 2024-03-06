document.addEventListener('DOMContentLoaded', function() {

const game = new Chess()
let board = null
let $status = $('#status')
let $fen = $('#fen')
let $pgn = $('#pgn')


async function submitMove () {
  try {
    const response = await fetch('http://localhost:3000/api/game/updategame', {
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

function onDragStart (source, piece, position, orientation) {
  console.log("drag start");

  console.log("orientation : ", orientation);

  // do not pick up pieces if the game is over
  if (game.game_over()) return false

  // only pick up pieces for the side to move
//   if ((orientation === 'black' && piece.search(/^w/) !== -1) || (orientation === 'white' && piece.search(/^b/) !== -1)) {
//     return false;
// }

// only pick up pieces for the side to move
if ((game.turn() === 'w' && piece.search(/^b/) !== -1) || (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
    return false
}
}

function onDrop (source, target) {
  console.log("drag stopped");
  console.log("game obj : ", game);
  // see if the move is legal
  let move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  })
  console.log("move : ", move);

  // illegal move
  if (move === null) return 'snapback'

  updateStatus()
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd () {
  board.position(game.fen())
}

function updateStatus () {
  let status = ''

  let moveColor = 'White'
  if (game.turn() === 'b') {
    moveColor = 'Black'
  }

  // checkmate?
  if (game.in_checkmate()) {
    status = 'Game over, ' + moveColor + ' is in checkmate.'
  }

  // draw?
  else if (game.in_draw()) {
    status = 'Game over, drawn position'
  }

  // game still on
  else {
    status = moveColor + ' to move'

    // check?
    if (game.in_check()) {
      status += ', ' + moveColor + ' is in check'
    }
  }

  $status.html(status)
  $fen.html(game.fen())
  $pgn.html(game.pgn())
}

function create_config(board_pos, orientation) {

  let config = {
    draggable: true,
    position: board_pos,// board positions
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd,
    showNotation: true,
    showErrors: console,
    orientation: orientation
  }
  return config
}
// get white or black page
function get_page_orientation(){
  const url = window.location.href
  if (url.includes("white.html")) {
    return "white"
  } else if (url.includes("black.html")) {
    return "black"
  }
}


let page_orientation = get_page_orientation();
let config = create_config('start', page_orientation);
console.log("config : ", config);
board = Chessboard('myBoard', config)

updateStatus()

document.getElementById("submitMove").addEventListener("click", () => {
  console.log("submit move");
  submitMove();
})


function updateGamePage(game_obj) {
  game.load(game_obj.fen);
  board.destroy();
  board = Chessboard('myBoard', create_config(game_obj.fen, page_orientation));
  updateStatus();
}



const eventSource = new EventSource('http://localhost:3000/api/game/gameupdatestream');
eventSource.onmessage = function(event) {
    const gameData = JSON.parse(event.data);
    console.log('Received game update:', gameData);
    // Process the received game update, update UI, etc.
    updateGamePage(gameData);
};
});