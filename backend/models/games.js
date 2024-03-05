// cretae user model, user will include random user id, current game, in team or solo
import mongoose from "mongoose";

const gameSchema = new mongoose.Schema({
    gamecode: {
        type: String,
        unique: true,
        required: true
    },
    gamestatus: {
        type: String,
        enum: ["waiting", "inprogress", "complete", "abandoned"],
        default: "waiting",
        required: true
    },
    pgn: {
        type: String,
        default: ""
    },
    fen: {
        type: String,
        default: ""
    },
    white: {
        type: String,
        default: "",
        required: true,
        color: "white"
    },
    black: {
        type: String,
        default: "",
        color: "black"
    },
    whiteAssist: {
        type: String,
        default: "",
        color: "whiteAssist"
    }

    
});

const Game = mongoose.model("Game", gameSchema);


export default Game;