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
        id: {
            type: String,
            default: ""
        },
        moves: {
            type: String,
            default: ""
        }
    },
    black: {
        id: {
            type: String,
            default: ""
        },
        moves: {
            type: String,
            default: ""
        }
    },
    whiteAssist: {
        id: {
            type: String,
            default: ""
        },
        moves: {
            type: String,
            default: ""
        }
    },
    consensus: {
        type: Boolean,
        default: false // Can only be true when both whiteAssist and white moves are equal
    }
});

const consensusSchema = new mongoose.Schema({
    gamecode: {
        type: String,
        required: true
    },
    boardId: {
        type: String,
        required: true
    },
    fen: {
        type: String,
        default: ""
    },
    move: {
        type: String,
        default: ""
    },
    lastmove: {
        type: String,
        default: ""
    }
});

const Game = mongoose.model("Game", gameSchema);
const ConsensusGames = mongoose.model("ConsensusGames", consensusSchema);

export { Game, ConsensusGames };
