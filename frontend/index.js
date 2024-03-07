import { api_url } from "./baseurl.js";
function setLocalStorage(key, data) {
    localStorage.setItem(key, data);
}

async function contineuGame(continueGameCode, playerID) {
    console.log("continueGameCode : ", continueGameCode);
    console.log("playerID : ", playerID);
    try {
        const response = await fetch(api_url + '/continue', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                gameCode: continueGameCode,
                playerID: playerID
            })
        });
        if (!response.ok) {
            throw new Error('Failed to continue game');
        }
        const data = await response.json();
        console.log('Success:', data);
        localStorage.clear();
        setLocalStorage("game_obj", JSON.stringify(data));
        setLocalStorage("gamecode", continueGameCode);
        setLocalStorage("playerID", playerID);

        // check where to redirect based on playerID
        if (data.black.id === playerID) {
            window.location.href = "black.html";
        } else if (data.whiteAssist.id === playerID) {
            window.location.href = "white.html";
        } else if (data.white.id === playerID) {
            window.location.href = "white.html";
        }
}
    catch (error) {
        console.error('Error:', error);
    }
}

async function joinGame(gameCode, color) {
    console.log("color : ", color);
    try {
        const response = await fetch(api_url + '/join', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                gameCode: gameCode,
                color: color
            })
        });
        if (!response.ok) {
            throw new Error('Failed to join game');
        }
        const data = await response.json();
        console.log('Success:', data);
        setLocalStorage("game_obj", JSON.stringify(data));
        setLocalStorage("gamecode", gameCode);
        // get id of player from data object and set playerid in localstorage
        if(color === "black") {
            let playerID = data.black.id;
            setLocalStorage("playerID", playerID);
        }
        else if(color === "whiteAssist") {
            let playerID = data.whiteAssist.id;
            setLocalStorage("playerID", playerID);
        }
        else if(color === "white") {
            let playerID = data.white.id;
            setLocalStorage("playerID", playerID);
        }
        window.location.href = color + ".html";
    } catch (error) {
        console.error('Error:', error);
    }
}


async function createGame() {
let gameCode = document.getElementById("gameCode").value;
console.log("gameCode : ", gameCode);
try {
    const response = await fetch(api_url + '/create', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            gameCode: gameCode
        })
    });

    if (!response.ok) {
        throw new Error('Failed to create game');
    }

    const data = await response.json();
    console.log('Success:', data);
    localStorage.clear();
    setLocalStorage("game_obj", JSON.stringify(data));
    setLocalStorage("gamecode", gameCode);
    setLocalStorage("PlayerID", data.white.id);
    window.location.href = "white.html";
} catch (error) {
    console.error('Error:', error);
}
}    // handle clicks
document.getElementById("start").addEventListener("click", () => {
    let result =  createGame();
    console.log("result : ", result);
    // redirect to game.html
    //window.location.href = "/game.html?gameCode=" + document.getElementById("gameCode").value
    // window.location.href = "game.html"
})
document.getElementById("joinBlack").addEventListener("click", () => {
    joinGame(document.getElementById("gameCode").value, "black")
})
document.getElementById("joinWhite").addEventListener("click", () => {
    joinGame(document.getElementById("gameCode").value, "white")
})


document.getElementById("continueGame").addEventListener("click", () => {
    console.log("continue game, need gameID and playerID");
    contineuGame(document.getElementById("continueGameCode").value, document.getElementById("playerID").value)
})