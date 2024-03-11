import express from "express";
import {createGame, gameExists, joinGame, 
    updatedGame, gameUpdatesStream, continueGame, suggestMoves,
    getGame, sendConsensus} from "../controllers/gameController.js";

const router = express.Router();

// create a new game
router.post("/create", createGame);
router.post("/exists", gameExists);
router.post("/join", joinGame);
router.post("/continue", continueGame);
router.post("/updategame", updatedGame);
router.post("/suggestmoves", suggestMoves);
router.get("/gameupdatestream", gameUpdatesStream); //  server side events update
router.post("/getgame", getGame);
router.post("/consensus", sendConsensus);
export default router;