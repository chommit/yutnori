

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