import mongoose from "mongoose";
import User from "../models/users.js";


export const createGame = async (req, res) => {
    return res.status(200).json({message: "create game"});
};
