// black.js

import { api_url } from "./baseurl.js";
import { initializeBoard, onDrop, onSnapEnd, updateStatus } from "./gamelogic.js";

// Define black-specific logic here

// Define a single game instance for black
const games = [null];

// Define a single board variable for black
let board = null;

// Event listeners and other black-specific logic
document.addEventListener('DOMContentLoaded', async function() {
    // Initialize black board
    let game_data = localStorage.getItem("game_obj");
    if(game_data) {
        game_data = JSON.parse(game_data);
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
    updateStatus(games[i], 'board' + (i + 1)); // Update status for the initial game state
  }
}