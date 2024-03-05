import express from "express";
import {createGame, gameExists, joinGame, updatedGame, gameUpdates, continueGame} from "../controllers/gameController.js";

const router = express.Router();

// create a new game
router.post("/create", createGame);
router.post("/exists", gameExists);
router.post("/join", joinGame);
router.post("/continue", continueGame);
router.post("/updategame", updatedGame);
router.get("/ganeupdatestream", gameUpdates); //  server side events update
export default router;