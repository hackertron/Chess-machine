import mongoose from "mongoose";
import Game from '../models/games.js'
import {v4 as uuidv4} from 'uuid';

export const createGame = async (req, res) => {
    const gamecode = req.body.gameCode;
    
    const whiteString = uuidv4(); // Generate a random string for the white player
    const game = new Game({
        gamecode,
        gamestatus: "waiting",
        pgn: "",
        white: { id: whiteString, moves: "" }, // Update to use nested object for white
    });
    try {
        const newGame = await game.save();
        res.status(201).json(newGame);
    } catch (error) {
        res.status(409).json({message: error.message});
    }
};

export const gameExists = async(req, res) => {
    const gamecode = req.body.gamecode;
    try {
        const game = await Game.findOne({gamecode});
        res.status(200).json(game);
    } catch (error) {
        res.status(404).json({message: error.message});
    }
};

export const joinGame = async (req, res) => {
    const gamecode = req.body.gameCode;
    const color = req.body.color;
   
    try {
        const game = await Game.findOne({ gamecode });
   
        if (game) {
            const canJoin =
                game.gamestatus === "waiting" ||
                (game.gamestatus === "inprogress" &&
                    (game.black.id === "" || game.whiteAssist.id === ""));
            const colorProperty = color === "black" ? "black" : "whiteAssist";
   
            if (canJoin) {
                game.gamestatus = "inprogress";
                game[colorProperty] = { id: uuidv4(), moves: "" }; // Assign UUID to the specified color property
   
                const updatedGame = await Game.findByIdAndUpdate(game._id, game, { new: true });
                res.status(200).json(updatedGame);
            } else {
                res.status(409).json({ message: "Game already in progress" });
            }
        } else {
            res.status(404).json({ message: "Game not found" });
        }
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

export const updatedGame = async (req, res) => {
    const game = req.body;
    const updatedGame = await Game.findByIdAndUpdate(game._id, game, { new: true });
    res.status(200).json(updatedGame);
};

export const gameUpdatesStream = async(req, res) => {
    // Implement server-sent events to stream game updates
    return res.status(200).json({message: "success"});
};

export const continueGame = async(req, res) => {
    const playerID = req.body.playerID;
    const gamecode = req.body.gameCode;
    
    try {
        const game = await Game.findOne({gamecode});
        if (!game) {
            return res.status(404).json({message: "Game not found"});
        }
        if (game.black.id !== playerID && game.whiteAssist.id !== playerID && game.white.id !== playerID) {
            return res.status(404).json({message: "Player not in game"});
        }
        return res.status(200).json(game);
    } catch (error) {
        return res.status(404).json({message: error.message});
    }
};
