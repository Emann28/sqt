import Tetris from "../Tetris.js";
import Score from "../Score.js";
import R from "../ramda.js";

const example_game = Tetris.new_game();
const field_string = `----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
----------
-S--------
SSS-------
SSSZ-IOOJJ
TSZZ-IOOJJ
TTZL-IOOJJ
TLLL-IOOJJ`;
example_game.field = field_string.split("\n").map(
    (s) => s.replace(/-/g, " ").split("")
);

console.log(example_game)

describe("Score", function () {
    it(
        `A new tetris game
        * Starts on level one
        * With no lines cleared
        * With a score of zero`,
        function () {
            const new_game = Tetris.new_game();
            const score = new_game.score;
            if (Score.level(score) !== 1) {
                throw new Error("New games should start on level one");
            }
            if (score.lines_cleared !== 0) {
                throw new Error("New games should have no lines cleared");
            }
            if (score.score !== 0) {
                throw new Error("New games should have a zero score");
            }
        }
    );

    it(
        `The score tracks the lines that get cleared`,
        function () {
            let game = example_game;
            // Slot an I tetromino into the hole and drop.
            game.current_tetromino = Tetris.I_tetromino;
            game = Tetris.rotate_ccw(game);
            game = Tetris.hard_drop(game);

            if (game.score.lines_cleared !== 4) {
                throw new Error("Expecting 4 lines to clear");
            }
        }
    );

    it(
        `A single line clear scores 100 × level`,
        function () {
            let game = example_game;
            // Slot a T tetromino into the hole and drop.
            // This can only go one deep.
            game.current_tetromino = Tetris.T_tetromino;

            // I could use hard_drop here, but that would also score.
            // Instead wait for it to drop 22 times.
            console.log("the current field",example_game);
            R.range(0, 22).forEach(function () {
                game = Tetris.next_turn(game);
                
            });
            
            if (game.score.score !== 100) {
                throw new Error("A single row cleared should score 100");
            }
        }
    );

   
    it(
        `A double line clear scores 300 × level`,
        function () {
            let game = example_game;
            game.current_tetromino = Tetris.L_tetromino;
            game = Tetris.rotate_cw(game);
           
            R.range(0, 22).forEach(function () {
                game = Tetris.next_turn(game);
            });
            if (game.score.score !== 300) {
                throw new Error("A double line row clear should score 300");
            }
        }
    );

    it(
        `A triple line clear scores 500 × level`,
        function () {
            let game = example_game;
            // Set up the initial game state so that three lines can be cleared
            game.field[16] = ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-"];
            game.field[17] = ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-"];
            game.field[18] = ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-"];
            game.current_tetromino = Tetris.I_tetromino;
      
            // Simulate dropping the tetromino
            R.range(0, 22).forEach(function () {
                game = Tetris.next_turn(game);
            });
      
            if (game.score.score !== 500) {
                throw new Error("A triple line row clear should score 500");
            }
        }
      );
      

    it(
        `A tetris scores 800 × level`,
        function () {
            let game = example_game;
            game.current_tetromino = Tetris.I_tetromino;
            game = Tetris.rotate_ccw(game); // Place I-tetromino
            R.range(0, 22).forEach(function () {
                game = Tetris.next_turn(game);
            });
            if (game.score.score !== 800) {
                throw new Error("Expecting 4 lines to clear resulting in 800 points");
            }
        }
    );

    it(
        `Back to back tetrises score 1200 × level`,
        function () {
            let game = example_game;
            let updateScore = 800;
    
            // Place the first I-tetromino
            game.current_tetromino = Tetris.I_tetromino;
            game = Tetris.rotate_ccw(game);
    
            // Simulate clearing the lines for the first Tetris
            R.range(0, 22).forEach(function () {
                game = Tetris.next_turn(game);
            });
    
            if (game.score.score !== updateScore) {
                throw new Error("Expecting 4 lines to clear resulting in 800 points");
            }
    
            // Reset the game properties for back-to-back Tetris
            let new_game = example_game;
            new_game.score.last_clear_tetris = true; // Reset the lines cleared
            updateScore += 400;
    
            // Place the second I-tetromino for back-to-back Tetris
            new_game.current_tetromino = Tetris.I_tetromino;
            new_game = Tetris.rotate_ccw(new_game);
    
            // Simulate clearing the lines for the second Tetris
            R.range(0, 22).forEach(function () {
                new_game = Tetris.next_turn(new_game);
            });
    
            // Check if it's back-to-back Tetrises and the score is 1200 points
            console.log("score", new_game.score.score);
            console.log(new_game.score.lines_cleared);
            // Check if it's back-to-back Tetrises by comparing lines cleared with the first Tetris
            if (new_game.score.score !== updateScore) {
                throw new Error("Expecting back-to-back Tetrises to score 1200 points");
            }
        }
    );
    

    it(
        "A soft drop scores 1 point per cell descended",
        function () {
            let game = example_game;
            // Set up the game state to perform a soft drop.
            game.current_tetromino = Tetris.I_tetromino;
            game = Tetris.rotate_ccw(game);

            // Simulate continuous soft dropping until the tetromino reaches the bottom
            R.range(0, 22).forEach(function () {
                game = Tetris.soft_drop(game);
                game = Tetris.next_turn(game);
            });

            // Calculate the number of cells descended
            const cellsDescended = 20; // Assuming the I is a vertical tetromino and descends 20 cells
            const expectedScore = 800 + cellsDescended * 1; // // Expected score as I tetromino clears 4 lines
            console.log(game.score.score,expectedScore);
            if (game.score.score !== expectedScore) {
                throw new Error("Soft drop should score 1 point per cell descended");
            }
        }
    );

    
    
    
    

    it(
        `A hard drop scores 2 points per cell descended`,
        function () {
            let game = example_game;
            // Set up the game state to perform a hard drop.
            game.current_tetromino = Tetris.I_tetromino;
            game = Tetris.rotate_ccw(game);
            game = Tetris.hard_drop(game); // Perform a hard drop
        
            // Calculate the number of cells descended
            const cellsDescended = 20; // Assuming the I is vertical tetromino descends 2 cells
            const expectedScore = 800+ cellsDescended * 2; // Expected score as I tetromino clears 4 lines
            console.log(game.score.score,expectedScore);
            if (game.score.score !== expectedScore) {
                throw new Error("Hard drop should score 2 points per cell descended");
            }
        }
    );
    
    
    
    it(
        "Advancing the turn without manually dropping scores nothing",
        function () {
            let game = example_game;
            // Set up the game state to advance the turn without any manual drops.
            const initialScore = game.score.score;
            Tetris.next_turn(game);

            if (game.score.score !== initialScore) {
                throw new Error("Advancing the turn without manually dropping should not score points");
            }
        }
    );
});
