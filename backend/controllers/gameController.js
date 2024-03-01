import mongoose from "mongoose";
import Game from '../models/games.js'
import {v4 as uuidv4} from 'uuid';

export const createGame = async (req, res) => {
    // gamecode, color (only white in creationg)
    // generate random string with gameCode length for white

    const gamecode = req.body.gameCode
    console.log("gamecode : ", gamecode);
    // generate uuid string random
    const WhiteString = uuidv4();
    const game = new Game({
        gamecode,
        gamestatus: "waiting",
        pgn: "",
        white: WhiteString,
    })
    try {
        const newGame = await game.save();
        res.status(201).json(newGame);
    } catch (error) {
        res.status(409).json({message: error.message});
    }
}