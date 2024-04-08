import {Game, ConsensusGames} from '../models/games.js'
import { EventEmitter } from 'events';
import { getRandomPuzzle } from './puzzle.js';

const emitter = new EventEmitter();


export const ping = async(req, res) => {
    res.status(200).json({message: "pong"});
}

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
        console.log("sending emit data to client: ", game);
        res.write(`data: ${JSON.stringify(game)}\n\n`);
    };

    emitter.on('gameUpdate', updateHandler);

    req.on('close', () => {
        emitter.off('gameUpdate', updateHandler);
    });
};

export const createGame = async (req, res) => {
    const gamecode = req.body.gameCode;
    const username = req.body.username;
    
    const puzzle = getRandomPuzzle();
    const game = new Game({
        gamecode,
        gamestatus: "waiting",
        pgn: "",
        fen: puzzle.FEN,
        white: { username: username, moves: "" },
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
    const username = req.body.username;
   
    try {
        const game = await Game.findOne({ gamecode });
   
        if (game) {
            const canJoin =
                game.gamestatus === "waiting" ||
                (game.gamestatus === "inprogress" &&
                    (game.black.username === "" || game.whiteAssist.username === ""));
            const colorProperty = color === "black" ? "black" : "whiteAssist";
   
            if (canJoin) {
                game.gamestatus = "inprogress";
                game[colorProperty] = { username: username, moves: "" };
   
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
    const {gamecode, boardId, fen} = req.body;
    console.log("gamecode : ", gamecode);
    console.log("boardId : ", boardId);
    console.log("game_fen : ", fen);
    try {
        const consensusGame = await ConsensusGames.findOne({"gamecode": gamecode, "boardId": boardId});
        if (!consensusGame) {
            const move = fen;
            // create one and return
            const consensus = new ConsensusGames({
                gamecode,
                boardId,
                fen,
                move
            })
            await consensus.save();
            return res.status(200).json(consensus);
        }
        // If consensus.move is empty, set it to fen
        if (!consensusGame.move) {
            consensusGame.move = fen;
        }
        // set consensus
        consensusGame.fen = fen;
        await consensusGame.save();
        // Emit game update event
        emitter.emit('gameUpdate', consensusGame);
        return res.status(200).json(consensusGame);
    }
    catch (error) {
        console.log("error: ", error.message);
        console.log("error: ", error);
        return res.status(500).json({message: error.message});
    }
}


export const continueGame = async(req, res) => {
    const username = req.body.username;
    const gamecode = req.body.gameCode;
    
    try {
        const game = await Game.findOne({gamecode});
        if (!game) {
            return res.status(404).json({message: "Game not found"});
        }
        if (game.black.username !== username && game.whiteAssist.username !== username && game.white.username !== username) {
            return res.status(404).json({message: "Player not in game"});
        }
        // Emit game update event
        emitter.emit('gameUpdate', game);
        return res.status(200).json(game);
    } catch (error) {
        return res.status(404).json({message: error.message});
    }
};


export const sendConsensus = async(req, res) => {
    const {username, gamecode, boardId} = req.body;
    console.log("username : ", username);
    console.log("gamecode : ", gamecode);
    console.log("boardId : ", boardId);
    let emitResults = false;
    try {
        const game = await Game.findOne({"gamecode": gamecode});
        if (!game) {
            return res.status(404).json({message: "Game not found"});
        }
        // check username is white or whiteAssist and then set it's move to boardId
        if (username === game.white.username) {
            console.log("setting white!!!  : ", username);
            game.white.moves = boardId;
        } else if (username === game.whiteAssist.username) {
            console.log("setting whiteAssist!!!  : ", username);
            game.whiteAssist.moves = boardId;
        }
        console.log("white moves : ", game.white.moves);
        console.log("whiteAssist moves : ", game.whiteAssist.moves);
        // set consensus
        if(game.white.moves === game.whiteAssist.moves && game.white.moves !== "" && game.whiteAssist.moves !== "") {
            game.consensus = true;
        }
        if(game.consensus) {
            console.log("consensus reached");
            const consensusGame = await ConsensusGames.findOne({"gamecode": gamecode, "boardId": boardId});
            game.fen = consensusGame.move;
            emitResults = true;
            game.consensus = false;
            game.white.moves = "";
            game.whiteAssist.moves = "";
            // delete consensusGame with gamecode all boards
            await ConsensusGames.deleteMany({"gamecode": gamecode});
        }
        const updatedGame = await Game.findByIdAndUpdate(game._id, game, { new: true });
        if(emitResults) {
            // Emit game update event
            emitter.emit('gameUpdate', updatedGame);
        }
        return res.status(200).json(updatedGame);
    }
    catch (error) {
        console.log("error: ", error.message);
        console.log("error: ", error);
        return res.status(500).json({message: error.message});
    }
}