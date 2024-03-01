// cretae user model, user will include random user id, current game, in team or solo
import mongoose from "mongoose";

const gameSchema = new mongoose.Schema({
    gamecode: {
        type: String,
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
    }
    
});

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    color: {
        type: String,
        enum: ["white", "black"],
        required: true
    },
    secondPlayer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    game: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Game"
    }
});

const User = mongoose.model("User", userSchema);

export default User;