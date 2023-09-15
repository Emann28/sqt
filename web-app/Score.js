/**
 * @namespace Score
 * @author A. Freddie Page
 * @version 2022.23
 * This module provides the scoring system for a Tetris Game.
 */
const Score = {};

/**
 * The score object contains information about the score of the game.
 * Currently it is implemented as a single number,
 * but could include other information such as the number of lines cleared.
 * @typedef {object} Score
 * @memberof Score
 * @property {number} score The current score.
 * @property {number} lines_cleared The number of lines cleared.
 * @property {boolean} last_clear_tetris Indicates if the last line cleared was a Tetris.
 */

/**
 * Returns a game state for a new Tetris Game.
 * @function
 * @memberof Score
 * @returns {Score.Score} The new game.
 */
Score.new_score = function () {
    const Score = {
        "score":0,
        "lines_cleared": 0,
        "last_clear_tetris": false
    };
    return Score;
};

/**
 * Returns the current level based on the number of lines cleared.
 * You start at level 1 and advance a level every 10 lines cleared.
 * @function
 * @memberof Score
 * @param {Score} score - The Score object containing the lines_cleared property.
 * @returns {number} The current level.
 */

Score.level = function (score) {
    const linesCleared = score.lines_cleared;
    const level = Math.floor(linesCleared / 10) + 1; // Start at level 1

    return level;
};

/**
 * Updates the score and tracks back-to-back Tetrises when lines are cleared.
 * @function
 * @memberof Score
 * @param {number} clearedLines The number of lines cleared.
 * @param {Score} currentScore The current Score object.
 * @returns {Score} A new Score object with updated properties.
 */
Score.cleared_lines = function (clearedLines, currentScore) {
    const level = Score.level(currentScore);
    let lineScore = 0;
    let backToBack = currentScore.last_clear_tetris;

    switch (clearedLines) {
        case 1:
            lineScore = 100 * level;
            backToBack = false; 
            break;
        case 2:
            lineScore = 300 * level;
            backToBack = false; 
            break;
        case 3:
            lineScore = 500 * level;
            backToBack = false; 
            break;
        case 4:
            lineScore = 800 * level;
            if (currentScore.last_clear_tetris) {
                lineScore += 400 * level;
            }
            backToBack = true; 
            break;
    }

    const updatedScore = {
        "score": currentScore.score + lineScore,
        "lines_cleared": currentScore.lines_cleared + clearedLines,
        "last_clear_tetris": backToBack,
    };

    return updatedScore;
};

/**
 * Add points to the current score.
 * @function
 * @memberof Score
 * @param {Score} score The current score.
 * @param {number} points The number of points to add.
 * @returns {Score.Score} The updated score.
 */
Score.add_points = function (score, points) {
    return {
        "score": score.score + points,
        "lines_cleared": score.lines_cleared,
        "last_clear_tetris": score.last_clear_tetris
    };
};


export default Object.freeze(Score);



