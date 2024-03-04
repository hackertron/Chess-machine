function setLocalStorage(key, data) {
    localStorage.setItem(key, data);
}

async function createGame() {
let gameCode = document.getElementById("gameCode").value;
console.log("gameCode : ", gameCode);
try {
    const response = await fetch('http://localhost:3000/api/game/create', {
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
    setLocalStorage("game_obj", JSON.stringify(data));
    window.location.href = "game.html";
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

    //window.location.href = "game.html?gameCode=" + document.getElementById("gameCode").value + "&color=black"
    window.location.href = "black.html"
})
document.getElementById("joinWhite").addEventListener("click", () => {
    //window.location.href = "game.html?gameCode=" + document.getElementById("gameCode").value + "&color=white"
    window.location.href = "white.html"
})