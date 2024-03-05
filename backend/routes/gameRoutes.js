import express from "express";
import {createGame, gameExists, joinGame} from "../controllers/gameController.js";

const router = express.Router();

// create a new game
router.post("/create", createGame);
router.post("/exists", gameExists);
router.post("/join", joinGame);
export default router;