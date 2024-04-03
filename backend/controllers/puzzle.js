//load mini-puzzle.json
import miniPuzzle from "./mini-puzzles-db.js";

//length of mini-puzzle
export function miniPuzzleLength() {
    return miniPuzzle.length;
}

export function getRandomPuzzle() {
    return miniPuzzle[Math.floor(Math.random() * (miniPuzzle.length-1))];
}