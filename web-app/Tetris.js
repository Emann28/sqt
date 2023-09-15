import R from "./ramda.js";
import Score from "./Score.js";

/**
 * @namespace Tetris
 * @author A. Freddie Page
 * @version 2022.23
 */
const Tetris = {};


//----------------------------------------------------------------------------//
// ## Type Definitions                                                        //
//----------------------------------------------------------------------------//


/**
 * A Tetris Game is all the information required to represent the current state
 * of a game, i.e. the field of play, location of the current tetromino,
 * how to generate next pieces, and score.
 * @typedef {object} Game
 * @memberof Tetris
 * @property {Tetris.Tetromino_bag} bag New pieces get drawn from the bag.
 * @property {Tetris.Tetromino} current_tetromino
 *     The tetromino in play descending in the field.
 * @property {Tetris.Field} field The grid containing locked in pieces.
 * @property {boolean} game_over Whether this game has ended.
 * @property {Tetris.Tetromino} next_tetromino The next piece to descend.
 * @property {number[]} position Where in the field is the current tetromino.
 * @property {Score.Score} score Information relating to the score of the game.
 */

/**
 * A field is the grid whose cells contain the locked in blocks from
 * tetrominos or are empty. The field doesn't contain the current tetromino.
 * It's ordered as a list of lines.
 * @typedef {Tetris.Line[]} Field
 * @memberof Tetris
 */

/**
 * A line is a horizontal list of 10 tetromino blocks.
 * @typedef {Tetris.Block_or_empty[]} Line
 * @memberof Tetris
 */

/**
 * A tetromino block on an empty space.
 * @typedef {(Tetris.Block | Tetris.Empty_block)} Block_or_empty
 * @memberof Tetris
 */

/**
 * Each tetromino is made of blocks. The blocks can correspond to the colour
 * of the tetromino they came from.
 * @typedef {("I" | "J" | "L" | "O" | "S" | "T" | "Z")} Block
 * @memberof Tetris
 */

/**
 * An empty space where a block could be.
 * @typedef {" "} Empty_block
 * @memberof Tetris
 */

/**
 * A tetromino is an arrangement of four blocks connected orthogonally.
 * Tetrominos express their own rotation state.
 * @typedef {object} Tetromino
 * @memberof Tetris
 * @property {Tetris.Block} block_type The type of the tetromino.
 * @property {number[]} centre Centre of rotation.
 * @property {Tetris.Block_or_empty[][]} grid The arrangement of the blocks.
 */

/**
 * A bag generates sequences of tetrominos.
 * It is a function that returns the next tetromino and a new bag.
 * The bag is an abstraction, there need not be a well defined contents.
 * @typedef {function} Tetromino_bag
 * @memberof Tetris
 * @returns {array<(Tetris.Tetromino | Tetris.Tetromino_bag)>}
 * @example
 * const [next_piece, next_bag] = bag();
 */

//----------------------------------------------------------------------------//
// ## Constant Members                                                        //
//----------------------------------------------------------------------------//

/**
 * I Tetromino
 * <pre>
 * 🟫🟫🟫🟫
 * </pre>
 * @constant {Tetris.Tetromino}
 * @memberof Tetris
 */
Tetris.I_tetromino = Object.freeze({
    "block_type": "I",
    "centre": [1, 0],
    "grid": [
        ["I", "I", "I", "I"]
    ]
});

/**
 * J Tetromino
 * <pre>
 * 🟧⬛⬛
 * 🟧🟧🟧
 * </pre>
 * @constant {Tetris.Tetromino}
 * @memberof Tetris
 */
Tetris.J_tetromino = Object.freeze({
    "block_type": "J",
    "centre": [1, 0],
    "grid": [
        ["J", "J", "J"],
        [" ", " ", "J"]
    ]
});

/**
 * L Tetromino
 * <pre>
 * 🟦🟦🟦
 * 🟦⬛⬛
 * </pre>
 * @constant {Tetris.Tetromino}
 * @memberof Tetris
 */
Tetris.L_tetromino = Object.freeze({
    "block_type": "L",
    "centre": [1, 0],
    "grid": [
        ["L", "L", "L"],
        ["L", " ", " "]
    ]
});

/**
 * O Tetromino
 * <pre>
 * 🟨🟨
 * 🟨🟨
 * </pre>
 * @constant {Tetris.Tetromino}
 * @memberof Tetris
 */
Tetris.O_tetromino = Object.freeze({
    "block_type": "O",
    "centre": [0.5, 0.5],
    "grid": [
        ["O", "O"],
        ["O", "O"]
    ]
});

/**
 * S Tetromino
 * <pre>
 * ⬛🟩🟩
 * 🟩🟩⬛
 * </pre>
 * @constant {Tetris.Tetromino}
 * @memberof Tetris
 */
Tetris.S_tetromino = Object.freeze({
    "block_type": "S",
    "centre": [1, 0],
    "grid": [
        [" ", "S", "S"],
        ["S", "S", " "]
    ]
});

/**
 * T Tetromino
 * <pre>
 * ⬛🟪⬛
 * 🟪🟪🟪
 * </pre>
 * @constant {Tetris.Tetromino}
 * @memberof Tetris
 */
Tetris.T_tetromino = Object.freeze({
    "block_type": "T",
    "centre": [1, 0],
    "grid": [
        ["T", "T", "T"],
        [" ", "T", " "]
    ]
});

/**
 * Z Tetromino
 * <pre>
 * 🟥🟥⬛
 * ⬛🟥🟥
 * </pre>
 * @constant {Tetris.Tetromino}
 * @memberof Tetris
 */
Tetris.Z_tetromino = Object.freeze({
    "block_type": "Z",
    "centre": [1, 0],
    "grid": [
        ["Z", "Z", " "],
        [" ", "Z", "Z"]
    ]
});

const empty_block = " ";

const all_tetrominos = [
    Tetris.I_tetromino,
    Tetris.J_tetromino,
    Tetris.L_tetromino,
    Tetris.O_tetromino,
    Tetris.S_tetromino,
    Tetris.T_tetromino,
    Tetris.Z_tetromino
];

/**
 * The height of a tetris field.
 * Includes buffer rows at the top that may not be visible.
 * @constant
 * @memberof Tetris
 * @default
 */
Tetris.field_height = 22;

/**
 * The visible height of a tetris field.
 * I.e. excluding the top buffer rows.
 * @constant
 * @memberof Tetris
 * @default
 */
Tetris.field_visible_height = 20;

/**
 * The width of a tetris field.
 * @constant
 * @memberof Tetris
 * @default
 */
Tetris.field_width = 10;

const starting_position = [Math.floor(Tetris.field_width / 2) - 1, 0];

//----------------------------------------------------------------------------//
// ## Methods                                                                 //
//----------------------------------------------------------------------------//

const random_bag = function (contents) {
    return function () {
        if (contents.length === 0) {
            return new_bag();
        }
        const picked_index = Math.floor(contents.length * Math.random());
        const tetromino = contents[picked_index];
        const new_contents = contents.filter(
            (ignore, index) => index !== picked_index
        );
        return [tetromino, random_bag(new_contents)];
    };
};

const new_bag = random_bag(all_tetrominos);

const new_line = function () {
    return R.repeat(empty_block, Tetris.field_width);
};

const new_field = function () {
    return R.times(new_line, Tetris.field_height);
};

/**
 * Returns a game state for a new Tetris Game.
 * @function
 * @memberof Tetris
 * @returns {Tetris.Game} The new game.
 */
Tetris.new_game = function () {
    const [current_tetromino, next_bag] = new_bag();
    const [next_tetromino, bag] = next_bag();

    return {
        "bag": bag,
        "current_tetromino": current_tetromino,
        "field": new_field(),
        "game_over": false,
        "next_tetromino": next_tetromino,
        "position": starting_position,
        "score": Score.new_score()
    };
};

/**
 * For a given tetromino and position,
 * return the coordinates of where its blocks would position in the field.
 * @function
 * @memberof Tetris
 * @param {Tetris.Tetromino} tetromino
 *     The current tetromino.
 * @param {number[]} position
 *     The coordinates `[x, y]` of the centre of the tetromino.
 * @returns {number[][]} The List of  coordinates `[x, y]` of each block.
 */
Tetris.tetromino_coordiates = function (tetromino, position) {
    return tetromino.grid.flatMap(function (row, row_index) {
        return row.flatMap(function (block, column_index) {
            if (block === empty_block) {
                return [];
            }
            return [[
                position[0] + column_index - Math.floor(tetromino.centre[0]),
                position[1] + row_index - Math.floor(tetromino.centre[1])
            ]];
        });
    });
};

const is_blocked_bottom = function (tetromino, position) {
    return Tetris.tetromino_coordiates(tetromino, position).some(
        (coord) => coord[1] >= Tetris.field_height
    );
};

const is_blocked_left = function (tetromino, position) {
    return Tetris.tetromino_coordiates(tetromino, position).some(
        (coord) => coord[0] < 0
    );
};

const is_blocked_right = function (tetromino, position) {
    return Tetris.tetromino_coordiates(tetromino, position).some(
        (coord) => coord[0] >= Tetris.field_width
    );
};

const is_blocked_by_geometry = function (field, tetromino, position) {
    return Tetris.tetromino_coordiates(tetromino, position).filter(
        (coord) => (
            coord[0] >= 0 &&
            coord[0] < Tetris.field_width &&
            coord[1] >= 0 &&
            coord[1] < Tetris.field_height
        )
    ).some(
        (coord) => field[coord[1]][coord[0]] !== empty_block
    );
};

const is_blocked = function (field, tetromino, position) {
    return (
        is_blocked_bottom(tetromino, position) ||
        is_blocked_left(tetromino, position) ||
        is_blocked_right(tetromino, position) ||
        is_blocked_by_geometry(field, tetromino, position)
    );
};

/**
 * Attempt to perform a left move on a game state.
 * If the current tetromino can be shifted once to the left, do so.
 * Otherwise return the origninal state unchanged.
 * @function
 * @memberof Tetris
 * @param {Tetris.Game} game The initial state of a game.
 * @returns {Tetris.Game} The state after a left move is attempted.
 */
Tetris.left = function (game) {
    if (Tetris.is_game_over(game)) {
        return game;
    }
    const new_position = [game.position[0] - 1, game.position[1]];
    if (is_blocked(game.field, game.current_tetromino, new_position)) {
        return game;
    }
    return R.mergeRight(game, {"position": new_position});
};

/**
 * Attempt to perform a right move on a game state.
 * If the current tetromino can be shifted once to the right, do so.
 * Otherwise return the origninal state unchanged.
 * @function
 * @memberof Tetris
 * @param {Tetris.Game} game The initial state of a game.
 * @returns {Tetris.Game} The state after a right move is attempted.
 */
Tetris.right = function (game) {
    if (Tetris.is_game_over(game)) {
        return game;
    }
    const new_position = [game.position[0] + 1, game.position[1]];
    if (is_blocked(game.field, game.current_tetromino, new_position)) {
        return game;
    }
    return R.mergeRight(game, {"position": new_position});
};

const rotate_grid_cw = R.pipe(R.reverse, R.transpose);
const rotate_grid_ccw = R.pipe(R.transpose, R.reverse);

const rotate_tetromino_cw = function (tetromino) {
    return {
        "block_type": tetromino.block_type,
        "centre": [
            tetromino.grid.length - 1 - tetromino.centre[1],
            tetromino.centre[0]
        ],
        "grid": rotate_grid_cw(tetromino.grid)
    };
};

const rotate_tetromino_ccw = function (tetromino) {
    return {
        "block_type": tetromino.block_type,
        "centre": [
            tetromino.centre[1],
            tetromino.grid[0].length - 1 - tetromino.centre[0]
        ],
        "grid": rotate_grid_ccw(tetromino.grid)
    };
};

/**
 * Attempt to perform a clockwise rotation on a game state.
 * If the current tetromino can be rotated clockwise, do so.
 * Otherwise return the origninal state unchanged.
 * @function
 * @memberof Tetris
 * @param {Tetris.Game} game The initial state of a game.
 * @returns {Tetris.Game} The state after a CW rotation is attempted.
 */
Tetris.rotate_cw = function (game) {
    if (Tetris.is_game_over(game)) {
        return game;
    }
    const new_rotation = rotate_tetromino_cw(game.current_tetromino);
    if (is_blocked(game.field, new_rotation, game.position)) {
        return game;
    }
    return R.mergeRight(game, {"current_tetromino": new_rotation});
};

/**
 * Attempt to perform a counter-clockwise rotation on a game state.
 * If the current tetromino can be rotated counter-clockwise, do so.
 * Otherwise return the origninal state unchanged.
 * @function
 * @memberof Tetris
 * @param {Tetris.Game} game The initial state of a game.
 * @returns {Tetris.Game} The state after a CCW rotation is attempted.
 */
Tetris.rotate_ccw = function (game) {
    if (Tetris.is_game_over(game)) {
        return game;
    }
    const new_rotation = rotate_tetromino_ccw(game.current_tetromino);
    if (is_blocked(game.field, new_rotation, game.position)) {
        return game;
    }
    return R.mergeRight(game, {"current_tetromino": new_rotation});
};

const descend = function (game,points = 0) {
    const new_position = [game.position[0], game.position[1] + 1];
    if (is_blocked(game.field, game.current_tetromino, new_position)) {
        return game;
    }
    game = R.mergeRight(game, { "position": new_position });
    return R.mergeRight(game, {"score": Score.add_points(game.score, points)});
};


/**
 * Attempt to perform a soft drop, where the piece descends one position.
 * This may accrue additional points.
 * If the piece can't be dropped, return the original state.
 * @function
 * @memberof Tetris
 * @param {Tetris.Game} game The initial state of a game.
 * @returns {Tetris.Game} The state after a soft drop is attempted.
 */
Tetris.soft_drop = function (game) {
    if (Tetris.is_game_over(game)) {
        return game;
    }
    return descend(game,1);
};

/**
 * Perform a hard drop, where the piece immediatelt fully descends
 * until it hits the bottom of the field or another block.
 * This may accrue additional points.
 * A hard drop will immediately advance to the next turn.
 * @function
 * @memberof Tetris
 * @param {Tetris.Game} game The initial state of a game.
 * @returns {Tetris.Game} The state after a soft drop is attempted.
 */
Tetris.hard_drop = function (game) {
    if (Tetris.is_game_over(game)) {
        return game;
    }
    const dropped_once = descend(game,2);
    if (R.equals(game, dropped_once)) {
        return Tetris.next_turn(game);
    }
    return Tetris.hard_drop(dropped_once);
};

const lose = R.set(R.lensProp("game_over"), true);

const lock = function (game) {
    const updated_field = R.clone(game.field);
    const coords = Tetris.tetromino_coordiates(
        game.current_tetromino,
        game.position
    );
    coords.forEach(function (coord) {
        updated_field[coord[1]][coord[0]] = game.current_tetromino.block_type;
    });
    return updated_field;
};

const is_complete_line = (line) => !line.some((block) => block === empty_block);


const pad_field = function (short_field) {
    const missing_row_count = Tetris.field_height - short_field.length;
    const new_rows = R.times(new_line, missing_row_count);
    return [...new_rows, ...short_field];
};



const clear_lines = R.pipe(
    R.reject(is_complete_line),
    pad_field
);

/**
 * next_turn advances the Tetris game.
 * It will attempt to descend the current tetromino once.
 * If this is possible, that game state is returned.
 * Otherwise it checks if the game is lost (The current state is blocked)
 * Then otherwise will lock the current tetromino in place and deploy the next
 * from the top of the field.
 * @function
 * @memberof Tetris
 * @param {Tetris.Game} game
 * @returns {Tetris.Game}
 */
Tetris.next_turn = function (game) {
    console.log(game);

    if (game.game_over) {
        return game;
    }

    // If the current piece can descend, do that.
    const descended = descend(game);
    if (!R.equals(game, descended)) {
        return descended;
    }

    // Is the current piece on top of a locked in piece?
    // I.e. it's just been deployed and something is in the way.
    // In this case, lose the game.
    if (is_blocked_by_geometry(
        game.field,
        game.current_tetromino,
        game.position
    )) {
        return lose(game);
    }

    // Otherwise, we can't descend and we've not lost,
    // So lock the current piece in place and deploy the next.
    const locked_field = lock(game);
    const num_clear_lines = R.count(is_complete_line, locked_field);
    game.score = Score.cleared_lines(num_clear_lines, game.score);
    const cleared_field = clear_lines(locked_field);

    const [next_tetromino, bag] = game.bag();
   
    return {
        "bag": bag,
        "current_tetromino": game.next_tetromino,
        "field": cleared_field,
        "game_over": false,
        "next_tetromino": next_tetromino,
        "position": starting_position,
        "score": game.score
    };
    
};

/**
 * @function
 * @memberof Tetris
 * @param {Tetris.Game} game The game to check is over or in play.
 * @returns {boolean} Whether the game is over or not.
 */
Tetris.is_game_over = function (game) {
    return game.game_over;
};

export default Object.freeze(Tetris);
