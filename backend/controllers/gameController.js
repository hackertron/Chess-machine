import Game from '../models/games.js'
import {v4 as uuidv4} from 'uuid';
import { EventEmitter } from 'events';

const emitter = new EventEmitter();

export const getGame = async(req, res) => {
    //get game by gamecode
    const gamecode = req.body.gamecode;
    console.log("getGame body code : ", gamecode);
    try {
        const game = await Game.findOne({gamecode});
        res.status(200).json(game);
    } catch (error) {
        res.status(404).json({message: error.message});
    }
}

export const gameUpdatesStream = async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    console.log("hitting req: ");
    const updateHandler = (game) => {
        res.write(`data: ${JSON.stringify(game)}\n\n`);
    };

    emitter.on('gameUpdate', updateHandler);

    req.on('close', () => {
        emitter.off('gameUpdate', updateHandler);
    });
};

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
    const {gamecode, pgn, fen } = req.body;
    console.log("updateGame gamecode : ", req.body.gamecode);
    try {
        // fing game by gamecode and update
        const game = await Game.findOne({ gamecode });
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }
        game.pgn = pgn;
        game.fen = fen;
        // set consensus
        game.consensus = false;
        const updatedGame = await Game.findByIdAndUpdate(game._id, game, { new: true });
        // Emit game update event
        emitter.emit('gameUpdate', updatedGame);
        res.status(200).json(updatedGame);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update game' });
    }
};


export const suggestMoves = async(req, res) => {
    const playerID = req.body.playerID;
    const gamecode = req.body.gamecode;
    const move = req.body.move;
    console.log("gamecode : ", gamecode);
    console.log("playerID : ", playerID);
    console.log("move : ", move);
    try {
        const game = await Game.findOne({gamecode});
        if (!game) {
            return res.status(404).json({message: "Game not found"});
        }
        if (game.black.id !== playerID && game.whiteAssist.id !== playerID && game.white.id !== playerID) {
            return res.status(404).json({message: "Player not in game"});
        }
        // set the move for with playerid
        if (game.black.id === playerID) {
            game.black.moves = move;
        } else if (game.whiteAssist.id === playerID) {
            game.whiteAssist.moves = move;
        } else if (game.white.id === playerID) {
            game.white.moves = move;
        }
        // update if same moves
        if(game.white.moves === game.whiteAssist.moves){
            game.consensus = true;
        }
        const updatedGame = await Game.findByIdAndUpdate(game._id, game, { new: true });
        return res.status(200).json(updatedGame);
    } catch (error) {
        return res.status(404).json({message: error.message});
    }
}


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
        // Emit game update event
        emitter.emit('gameUpdate', game);
        return res.status(200).json(game);
    } catch (error) {
        return res.status(404).json({message: error.message});
    }
};
