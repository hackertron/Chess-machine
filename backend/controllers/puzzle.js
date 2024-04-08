//load mini-puzzle.json
import miniPuzzle from "./mini-puzzles-db.js";


export function getRandomPuzzle() {
    return miniPuzzle[Math.floor(Math.random() * (miniPuzzle.length-1))];
}