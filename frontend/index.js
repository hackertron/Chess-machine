import { Chess } from "chess.js";

const board = document.getElementById("chessful-board");
const game = new Chess();

board.addEventListener("movestart", (e) => {
  console.log(
    `Move started: ${e.detail.from}, ${e.detail.piece.color} ${e.detail.piece.pieceType}`
  );
  e.detail.setTargets(
    // This produces a list like ["e3", "e5"]
    game.moves({ square: e.detail.from, verbose: true }).map((m) => m.to)
  );
});

board.addEventListener("moveend", (e) => {
  console.log(
    `Move ending: ${e.detail.from} -> ${e.detail.to}, ${e.detail.piece.color} ${e.detail.piece.pieceType}`
  );
  const move = game.move({
    from: e.detail.from,
    to: e.detail.to
  });
  if (move === null) {
    e.preventDefault();
  }
});

board.addEventListener("movefinished", (e) => {
  board.fen = game.fen();
  board.turn = game.turn() === "w" ? "white" : "black";
});
