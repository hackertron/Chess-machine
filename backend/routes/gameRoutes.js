import express from "express";
import {createGame} from "../controllers/gameController.js";

const router = express.Router();

// create a new game
router.post("/create", createGame);

export default router;