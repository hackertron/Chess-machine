import { api_url } from "./baseurl.js";
function setLocalStorage(key, data) {
    localStorage.setItem(key, data);
}

async function contineuGame(continueGameCode, ContinueGameUsername) {
    console.log("continueGameCode : ", continueGameCode);
    console.log("ContinueGameUsername : ", ContinueGameUsername);
    try {
        const response = await fetch(api_url + '/continue', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                gameCode: continueGameCode,
                username: ContinueGameUsername
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
        setLocalStorage("username", ContinueGameUsername);

        // check where to redirect based on playerID
        if (data.black.username === ContinueGameUsername) {
            setLocalStorage("color", "black");
            window.location.href = "black.html";
        } else if (data.whiteAssist.username === ContinueGameUsername) {
            setLocalStorage("color", "whiteAssist");
            window.location.href = "white.html";
        } else if (data.white.username === ContinueGameUsername) {
            setLocalStorage("color", "white");
            window.location.href = "white.html";
        }
}
    catch (error) {
        console.error('Error:', error);
    }
}

async function joinGame(gameCode, color, username) {
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
                color: color,
                username: username
            })
        });
        if (!response.ok) {
            throw new Error('Failed to join game');
        }
        const data = await response.json();
        console.log('Success:', data);
        localStorage.clear();
        setLocalStorage("game_obj", JSON.stringify(data));
        setLocalStorage("gamecode", gameCode);
        // get id of player from data object and set username in localstorage
        if(color === "black") {
            setLocalStorage("color", "black");
            setLocalStorage("username", data.black.username);
        }
        else if(color === "whiteAssist") {
            setLocalStorage("color", "whiteAssist");
            setLocalStorage("username", data.whiteAssist.username);
            color = "white";
        }
        else if(color === "white") {
            setLocalStorage("color", "white");
            setLocalStorage("username", data.white.username);
        }
        window.location.href = color + ".html";
    } catch (error) {
        console.error('Error:', error);
    }
}


async function createGame() {
let gameCode = document.getElementById("gameCode").value;
let username = document.getElementById("username").value;
console.log("gameCode : ", gameCode);
console.log("username : ", username);
try {
    const response = await fetch(api_url + '/create', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            gameCode: gameCode,
            username: username
        })
    });

    if (!response.ok) {
        if(response.status == 409) {
            alert("Game Code Already Exists. Try a new different game code");
        }
        throw new Error('Failed to create game');
        
    }

    const data = await response.json();
    console.log('Success:', data);
    localStorage.clear();
    setLocalStorage("game_obj", JSON.stringify(data));
    setLocalStorage("gamecode", gameCode);
    setLocalStorage("playerID", data.white.id);
    setLocalStorage("color", "white");
    window.location.href = "white.html";
} catch (error) {
    console.error('Error:', error);
}
}    // handle clicks
document.getElementById("start").addEventListener("click", () => {
    let result =  createGame();
    console.log("result : ", result);
})
document.getElementById("joinBlack").addEventListener("click", () => {
    joinGame(document.getElementById("gameCode").value, "black", document.getElementById("username").value)
})
document.getElementById("joinWhiteAssist").addEventListener("click", () => {
    joinGame(document.getElementById("gameCode").value, "whiteAssist", document.getElementById("username").value)
})


document.getElementById("continueGame").addEventListener("click", () => {
    console.log("continue game, need gameID and playerID");
    contineuGame(document.getElementById("continueGameCode").value, document.getElementById("ContinueGameUsername").value)
})