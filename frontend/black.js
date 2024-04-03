// black.js

import { api_url } from "./baseurl.js";
import { initializeBoard, updateStatus, getGame } from "./gamelogic.js";

// Define black-specific logic here

// Define a single game instance for black
const games = [null];

// Define a single board variable for black
let boards = [null];

// Event listeners and other black-specific logic
document.addEventListener('DOMContentLoaded', async function() {
    // Initialize black board
    let game_data = await getGame();
    if(game_data) {
        initializeBlackBoard(game_data.fen);
    }
    
    // Additional black-specific logic
    // Add event listeners or other black-specific functionality here
});

function initializeBlackBoard(board_pos="start") {
  // Initialize board using common function from gamelogic.js
  for(let i = 0; i < games.length; i++) {
    const { game, board } = initializeBoard('board' + (i + 1), board_pos, "black");
    // Store game and board references
    games[i] = game;
    boards[i] = board;
    updateStatus(games[i], 'board' + (i + 1)); // Update status for the initial game state
  }
}

document.getElementById("submitMove").addEventListener("click", () => {
  submitMove();
});
const eventSource = new EventSource(api_url + '/gameupdatestream');
eventSource.onmessage = function(event) {
    const gameData = JSON.parse(event.data);
    console.log('Received game update:', gameData);
    initializeBlackBoard(gameData.fen);
};

export async function submitMove() {
  const game = games[0]; // main game
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

document.getElementById("submitMove").addEventListener("click", () => {
  console.log("submit move");
  submitMove();
});