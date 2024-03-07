import { submitMove, onDragStart, onDrop, onSnapEnd, updateStatus, create_config, get_page_orientation, updateGamePage } from './gamelogic.js';
import { api_url } from "./baseurl.js";
// const game = new Chess();
// let board2 = null;
// let page_orientation = get_page_orientation();
// let config = create_config('start', page_orientation);
// console.log("config : ", config);
// board2 = Chessboard('board2', config);
// board3 = Chessboard('board3', config);
// async function suggestmove(move) {
//     console.log("move : ", move);
// }

async function suggestionTextupdate(whiteMoves, whiteAssistMoves) {
    let suggestionText = "suggested moves from white team are " + whiteMoves + " and suggested moves from white assist team are " + whiteAssistMoves;
    document.getElementById("suggestionBox").innerHTML = suggestionText;
}

async function suggestmove(move, playerid, gamecode) {
    try {
        const response = await fetch(api_url + '/suggestmoves', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                move: move,
                playerID: playerid,
                gamecode: gamecode
            })
        });
        if (!response.ok) {
            throw new Error('Failed to suggest move');
        }
        const data = await response.json();
        console.log('Success:', data);
        suggestionTextupdate(data.white.moves, data.whiteAssist.moves);
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
    // Process the received game update, update UI, etc.
    updateGamePage(gameData);
    suggestionTextupdate(gameData.white.moves, gameData.whiteAssist.moves);
};