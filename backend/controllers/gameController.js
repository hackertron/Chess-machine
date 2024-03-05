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

export const gameExists = async(req, res) => {
    const gamecode = req.body.gamecode;
    console.log("gamecode : ", gamecode);
    try {
        const game = await Game.findOne({gamecode: gamecode});
        res.status(200).json(game);
    } catch (error) {
        res.status(404).json({message: error.message});
    }
}

export const joinGame = async (req, res) => {
    const gamecode = req.body.gameCode;
    const color = req.body.color;
   
    try {
      const game = await Game.findOne({ gamecode });
   
      if (game) {
        const canJoin =
          game.gamestatus === "waiting" ||
          (game.gamestatus === "inprogress" &&
            (game.black === "" || game.whiteAssist === ""));
        const colorProperty = color === "black" ? "black" : "whiteAssist";
   
        if (canJoin) {
          game.gamestatus = "inprogress";
          game[colorProperty] = uuidv4(); // Assign UUID to the specified color property
   
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