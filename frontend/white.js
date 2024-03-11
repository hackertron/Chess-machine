import { getGame, onDragStart, onDrop, onSnapEnd, updateStatus, updateGamePage,
    initializeBoard, boardObjects  } from './gamelogic.js';
import { api_url } from "./baseurl.js";

// Define three separate game instances
const games = [
    null,
    null,
    null
  ];

// Define three separate board variables
let boards = [
    null,
    null,
    null
  ];


async function suggestionTextupdate(whiteMoves, whiteAssistMoves) {
    let suggestionText = "suggested moves from white team are " + whiteMoves + " and suggested moves from white assist team are " + whiteAssistMoves;
    document.getElementById("suggestionBox").innerHTML = suggestionText;
}

async function suggestmove(playerid, boardId, game_fen, gamecode) {
    console.log("suggest move : ", playerid, boardId, game_fen, gamecode);
    try {
        const response = await fetch(api_url + '/suggestmoves', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                gamecode: gamecode,
                boardId: boardId,
                fen: game_fen
            })
        });
        if (!response.ok) {
            throw new Error('Failed to suggest move');
        }
        const data = await response.json();
        console.log('Success:', data);
        suggestionTextupdate(data);
    }
    catch (error) {
        console.error('Error:', error);
    }
}

document.getElementById("suggestMove").addEventListener("click", () => {
    let move = document.getElementById("suggestedMove").value;
    console.log("move : ", move);
    console.log("playerID : ", localStorage.getItem("playerID"));
    console.log("gamecode : ", localStorage.getItem("gamecode"));
    suggestmove(move, localStorage.getItem("playerID"), localStorage.getItem("gamecode"));
});

const eventSource = new EventSource(api_url + '/gameupdatestream');
eventSource.onmessage = function(event) {
    const gameData = JSON.parse(event.data);
    console.log('Received game update:', gameData);
    //check if gameData has boardId , if not update all boards
    if(!gameData.boardId) {
        initializeWhiteBoards(gameData.fen);
    } // update only the board with boardId
    else {
        // Process the received game update, update UI, etc.
        if(gameData.boardId == 'board2') {
            updateGamePage(gameData, games[1], gameData.boardId);
        } else if(gameData.boardId == 'board3') {
            updateGamePage(gameData, games[2], gameData.boardId);
        }
    }
};

// Event listeners and other white-specific logic
document.addEventListener('DOMContentLoaded', async function() {
    // get game data
    let game_data = localStorage.getItem("game_obj");
    if(game_data) {
        game_data = JSON.parse(game_data);
        initializeWhiteBoards(game_data.fen);
    }
    
    // Additional white-specific logic
    // Add event listeners or other white-specific functionality here
    for(let i = 0; i <= boards.length; i++) {
        const submitButton = document.getElementById(`board${i+1}-submit`);
        if(submitButton){
            submitButton.addEventListener("click", () => {
                console.log("board and game : ", boardObjects[`board${i+1}`], games[i].fen());
                suggestmove(localStorage.getItem("playerID"), `board${i+1}`, games[i].fen(), localStorage.getItem("gamecode"));
                
            })
        }
    }
});

function initializeWhiteBoards(board_pos="start") {
    console.log("init white boards : ", board_pos);
    let board_orientations = ["white","white","black"];
    if(localStorage.getItem("color") == "whiteAssist"){
        board_orientations = ["white","black","white"];
    }
    // Loop through each game and create its corresponding board
    for(let i = 0; i < games.length; i++) {
        // Initialize board using common function from gamelogic.js
        const { game, board } = initializeBoard('board' + (i + 1), board_pos, board_orientations[i]);
        // Store game and board references
        games[i] = game;
        boards[i] = board;
        updateStatus(games[i], 'board' + (i + 1)); // Update status for the initial game state
    }
}