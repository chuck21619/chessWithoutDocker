
var board;
var config = {
    position: 'start',
    onDrop: onDrop,
    draggable: true
}

function onLoad() {
    board = Chessboard('myBoard', config);
    document.getElementById("resetBoard").onclick = resetBoard;
}

function resetBoard() {
    board.start();
    updateOutputMessage("");
}

function updateOutputMessage(newMessage) {
    document.getElementById("output").innerHTML = newMessage;
}

function onDrop (source, target, piece, newPos, oldPos, orientation) {

    if (Chessboard.objToFen(newPos) == Chessboard.objToFen(oldPos)) {
        console.log("ignore drag drop - same position");
        return;
    }
    console.log("dropped piece");
}