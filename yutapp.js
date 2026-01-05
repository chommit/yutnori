const next_tile = new Map([['u1', 'u2'], ['u2', 'u3'], ['u3', 'u4'], ['u4', 'l0'], ['l0', 'l1'], 
    ['l1', 'l2'], ['l2', 'l3'], ['l3', 'l4'], ['l4', 'd0'], ['d0', 'd1'], ['d1', 'd2'], 
    ['d2', 'd3'], ['d3', 'd4'], ['d4', 'r0'], ['r0', 'r1'], ['r1', 'r2'], ['r2', 'r3'], 
    ['r3', 'r4'], ['r4', 'u0'], ['u0', 'finish'], ['finish', 'finish'],
    ['l0', '1d1'], ['1d1', '1d2'], ['1d2', 'star'], ['star', '1d4'], ['1d4', '1d5'], ['1d5', 'r0'],
    ['d0', '2d1'], ['2d1', '2d2'], ['2d2', 'star'], ['star', '2d4'], ['2d4', '2d5'], ['2d5', 'u0']]);

// entry [x, y] == being on tile x is precondition to enter tile y (star is weird)
const precond_map = new Map([['l0', '1d1'], ['d0', '2d1'], ['star', '2d4'], ['star', '1d4']]);

function Gameboard() {
    const board = {};

}

// node_name: name of node eg 'u1'
// precond: name of precond tile to enter this Node eg 'l0'
function Node(node_name, _precond = null) {
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
    const removePiece = () => {piece = null};
    const getPrecond = () => precond;
    return { getName, addPiece, getPiece, removePiece, getPrecond };
}