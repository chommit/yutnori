const next_tile = new Map([['u1',['u2']],['u2',['u3']],['u3',['u4']],['u4',['l0']],['l0',['l1', '1d1']],
    ['l1',['l2']],['l2',['l3']],['l3',['l4']],['l4',['d0']],['d0',['d1', '2d1']],['d1',['d2']],
    ['d2',['d3']],['d3',['d4']],['d4',['r0']],['r0',['r1']],['r1',['r2']],['r2',['r3']],
    ['r3',['r4']],['r4',['u0']],['u0',['finish']],['finish',['finish']],
    ['1d1',['1d2']],['1d2',['star']],['star',['1d4','2d4']],['1d4',['1d5']],['1d5',['r0']],
    ['2d1',['2d2']],['2d2',['star']],['2d4',['2d5']],['2d5',['u0']]]);
    
// entry [x, y] == entering tile x requires a precondition to have started on tile y (star is weird)
const precond_map = new Map([['1d1', 'l0'], ['2d1', 'd0']]);

const tile_set = new Set(['u1', 'u2', 'u3', 'u4', 'l0', 'l1', 'l2', 'l3', 'l4', 
    'd0', 'd1', 'd2', 'd3', 'd4', 'r0', 'r1', 'r2', 'r3', 'r4', 'u0', 'finish', 
    '1d1', '1d2', 'star', '1d4', '1d5', '2d1', '2d2', '2d4', '2d5'])

const special_rolls = new Map([["0000", 5], ["1111", 4], ["1000", -1]]);

function Gameboard() {
    const board = {}; // dumb board map of name -> TileNode, check next_tile for movements
    for (const keytile of tile_set) {
        const precond = precond_map.has(keytile) ? precond_map[keytile] : null;
        board[keytile] = TileNode(keytile, precond);
    }

}

// node_name: name of node eg 'u1'
// precond: name of precond tile to enter this Node eg 'l0'
function TileNode(node_name, _precond = null) {
    const name = node_name;
    let piece = null;
    const precond = _precond;

    const getName = () => name;
    const addPiece = (_piece) => {
        if (piece == null) {
            piece = _piece
        } else {
            piece.stackPiece(_piece);
        }
    };
    const getPiece = () => piece;
    const removePiece = (capture) => {
        const removed_count = capture ? piece.getStackCount() : 0;
        piece = null
        return removed_count;
    };
    const getPrecond = () => precond;
    return { getName, addPiece, getPiece, removePiece, getPrecond };
}

function Piece(_token) {
    const token = _token;
    let stack = 1;
    const stackPiece = (_piece) => (stack += _piece.getStackCount())
    const getStackCount = () => stack;
    return { stackPiece, getStackCount};
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
}

// token: 1 or 2
function Player(_name, _token) {
    const name = _name;
    const token = _token;
    let num_pieces_left = 4;
    let num_pieces_finished = 0;
    const incr_num_finished = (count) => {num_pieces_finished += count};
    const modify_num_left = (count) => {num_pieces_left += count};
    const get_num_finished = () => num_pieces_finished;
    const get_num_left = () => num_pieces_left;
    const get_name = () => name;
    const get_token = () => token;
    return { incr_num_finished, modify_num_left, get_num_finished, get_num_left,
        get_name, get_token };
}