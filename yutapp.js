const next_tile = new Map([['u1',['u2']],['u2',['u3']],['u3',['u4']],['u4',['l0']],['l0',['l1', '1d1']],
    ['l1',['l2']],['l2',['l3']],['l3',['l4']],['l4',['d0']],['d0',['d1', '2d1']],['d1',['d2']],
    ['d2',['d3']],['d3',['d4']],['d4',['r0']],['r0',['r1']],['r1',['r2']],['r2',['r3']],
    ['r3',['r4']],['r4',['u0']],['u0',['finish']],['finish',['finish']],
    ['1d1',['1d2']],['1d2',['1d3']],['1d3',['1d4','2d4']],['1d4',['1d5']],['1d5',['r0']],
    ['2d1',['2d2']],['2d2',['1d3']],['2d4',['2d5']],['2d5',['u0']]], ['home', 'u1']);

const tile_set = new Set(['u1', 'u2', 'u3', 'u4', 'l0', 'l1', 'l2', 'l3', 'l4', 
    'd0', 'd1', 'd2', 'd3', 'd4', 'r0', 'r1', 'r2', 'r3', 'r4', 'u0', 'finish', 
    '1d1', '1d2', '1d3', '1d4', '1d5', '2d1', '2d2', '2d4', '2d5'])

const prev_tile = new Map([['u1', ['u0']], ['u2', ['u1']], ['u3', ['u2']], ['u4', ['u3']], ['l0', ['u4']],
    ['l1', ['l0']], ['l2', ['l1']], ['l3', ['l2']], ['l4', ['l3']], 
    ['d0', ['l4']], ['d1', ['d0']], ['d2', ['d1']], ['d3', ['d2']], ['d4', ['d3']], 
    ['r0', ['d4', '1d5']], ['r1', ['r0']], ['r2', ['r1']], ['r3', ['r2']], ['r4', ['r3']],
    ['u0', ['r4', '2d5']], ['finish', ['finish']], 
    ['1d1', ['l0']], ['1d2', ['1d1']], ['1d3', ['1d2', '2d2']], ['1d4', ['1d3']], ['1d5', ['1d4']],
    ['2d1', ['d0']], ['2d2', ['2d1']], ['2d4', ['1d3']], ['2d5', ['2d4']]]);

const start_tile = new Map([[-1, ['nothing']], [1, ['u1']], [2, ['u2']], [3, ['u3']], 
                            [4, ['u4']], [5, ['l0']]])

const special_rolls = new Map([["0000", 5], ["1111", 4], ["1000", -1]]);

function Gameboard() {
    const map_board = {}; // dumb board map of name -> TileNode, check next_tile for movements
    for (const keytile of tile_set) {
        map_board[keytile] = TileNode(keytile);
    }

}

// node_name: name of node eg 'u1'
function TileNode(node_name) {
    const name = node_name;
    let piece = null;

    const getName = () => name;
    const addPiece = (_piece) => {
        if (piece == null) {
            piece = _piece
        } else {
            piece.stackPiece(_piece);
        }
    };
    const getPiece = () => piece;
    const removePiece = () => { // returns how many pieces removed from tile
        const removed_count = piece.getStackCount();
        piece = null
        return removed_count;
    };
    const pieceExists = () => (piece !== null);
    return { getName, addPiece, getPiece, removePiece, pieceExists };
}

function Piece(_token) {
    const token = _token;
    let stack = 1;
    const stackPiece = (_piece) => (stack += _piece.getStackCount())
    const getStackCount = () => stack;
    const getToken = () => token;
    return { stackPiece, getStackCount, getToken };
}


/* 
** The GameController will be responsible for controlling the 
** flow and state of the game's turns, as well as whether
** anybody has won the game.
*/

function GameController() {

    const board = Gameboard();
    const players = [Player("Player One - X", 1), Player("Player Two - O", 2)];
    let move_queue = []; // pseudoqueue
    let rolls_left = 1;
    let dice_roll_binary = [0, 0, 0, 0];
    let selected_piece = null;
    let selected_queue_index = -1;

    let activePlayer = players[0];
    let winner = null;

    const switchPlayerTurn = () => {
        activePlayer = (activePlayer.get_token() === players[0].get_token()) ? players[1] : players[0];
    };

    const getActivePlayer = () => activePlayer;
    const getNonActivePlayer = () => (activePlayer.get_token() === players[0].get_token()) ? players[1] : players[0];

    const printNewRound = () => {
        board.printBoard();
        console.log(`${getActivePlayer().get_name()}'s turn.`)
    };

    const rollDice = () => { // roll dice + + reduce rolls left
        for (let i = 0; i < 4; i++) {
            dice_roll_binary[i] = Math.floor(Math.random() * 2);
        }
        rolls_left -= 1;
    };

    const computeMovement = () => { // add to move_queue + add one more roll under 4/5 roll
        let move_string = dice_roll_binary.join('');
        let movement;
        if (special_rolls.has(move_string)) {
            movement = special_rolls[move_string];
            if (movement == 4 || movement == 5) {
                rolls_left += 1;
            }
        } else {
            movement = dice_roll_binary.reduce((acc, curr) => acc + curr, 0);
        }
        move_queue.push(movement);
    }

    const resetTurnState = () => { // reset turn state of dice rolls, move_queue, rolls_left, etc
        for (let i = 0; i < 4; i++) {
            dice_roll_binary[i] = 0;
        }
        move_queue = [];
        selected_piece = null
        selected_queue_index = -1;
    }

    const playRound = () => {
        while (rolls_left > 0) {
            rollDice();
            computeMovement();
            if (roll_left == 0) { // make move_queue judgement only when no more rolls to make
                while (selected_piece == null || selected_queue_index == -1) { // dont do this

                }
            }
        }
        resetTurnState();
    }

    const computeMoveArray = (tile = 'nothing', num_steps) => { // compute array of tiles to move to given tile + num_steps; forward
        // tile is 'u4' etc, num_steps = [1, 5] + -1
        // returns destination array eg ['l1', '1d1']
        if (tile == 'nothing') {
            return start_tile[num_steps];
        }
        if (num_steps == -1) {
            return prev_tile[tile];
        }
        let prev = '' // prev tile, only counts alt diagonal pathing 
        const move_array = [];
        for (const i = 0; i < num_steps; i++) {
            if (i == 0) {
                prev = tile;
                move_array = next_tile[tile];
            } else {
                for (const j = 0; j < move_array.size; j++) {
                    if (move_array[j] === '1d3') {
                        if (prev === '1d2') {
                            prev = '1d3';
                            move_array[j] = '1d4';
                        } else if (prev == '2d2') {
                            prev = '1d3';
                            move_array[j] = '2d4';
                        } else {
                            console.log("anamoly detected, no correct precond from 1d3");
                            console.assert(false);
                        }
                    } else {
                        prev = move_array.at(-1); // part of hack, alt diagonal path tile is last elt of next_tile arr
                        move_array[j] = next_tile[move_array[j]]
                    }
                }
            }
        }
        return move_array;
    }

    const makePieceMove = (piece, start_tile = 'nothing', dest_tile) => { 
        // generalizing movement method handles captures, stacks, finishes, and most other things
        // must handle move generation, piece init outside
        const dest_node = board.map_board[dest_tile];
        const dest_piece = dest_node.getPiece(); // null if DNE

        // remove piece from old start
        if (start_tile != 'nothing') {
            const start_node = board.map_board[start_tile];
            start_node.removePiece();
        }

        // move piece to new dest
        if (!dest_node.pieceExists()) {
            dest_node.addPiece(piece);
        } else if (dest_piece.getToken() == getActivePlayer().get_token()) { // do stack
            dest_node.addPiece(piece);
        } else { // do capture
            getNonActivePlayer().incr_num_left(dest_piece.getStackCount());
            dest_node.removePiece();
            dest_node.addPiece(piece);
            rolls_left += 1;
        }

        if (dest_node === 'finish') {
            getActivePlayer().incr_num_finished(dest_piece.getStackCount());
            dest_node.removePiece();
        }
    }
}

// token: 1 or 2
function Player(_name, _token) {
    const name = _name;
    const token = _token;
    let num_pieces_left = 4;
    let num_pieces_finished = 0;
    const incr_num_finished = (count) => {num_pieces_finished += count};
    const incr_num_left = (count) => {num_pieces_left += count};
    const get_num_finished = () => num_pieces_finished;
    const get_num_left = () => num_pieces_left;
    const get_name = () => name;
    const get_token = () => token;
    return { incr_num_finished, incr_num_left, get_num_finished, get_num_left,
        get_name, get_token };
}