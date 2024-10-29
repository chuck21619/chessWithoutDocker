
var board;
var config = {
    position: 'start',
    onDrop: onDrop,
    draggable: true
}

var something;

function onLoad() {
    console.log('onLoad()');
    board = Chessboard('myBoard', config);
    document.getElementById("resetBoard").onclick = resetBoard;
    something = "asdfsafdfasdfasdf";
}

function fenToOneHot() {
    fen = board.fen()
    const pieces = { 'p': 0, 'n': 1, 'b': 2, 'r': 3, 'q': 4, 'k': 5, 'P': 6, 'N': 7, 'B': 8, 'R': 9, 'Q': 10, 'K': 11 };
    const boardArray = Array(64).fill(12); // 12 represents empty squares

    let rank = 7, file = 0;
    for (let i = 0; i < fen.length; i++) {
        const char = fen[i];
        if (char === '/') {
            rank--;
            file = 0;
        } else if (char >= '1' && char <= '8') {
            file += parseInt(char);
        } else {
            boardArray[rank * 8 + file] = pieces[char];
            file++;
        }
    }

    const oneHotBoard = [];
    for (let i = 0; i < boardArray.length; i++) {
        const oneHotSquare = Array(13).fill(0);
        oneHotSquare[boardArray[i]] = 1;
        oneHotBoard.push(...oneHotSquare);
    }
    //TODO: APPENDTURNTTOENCODING
    return oneHotBoard;
}

async function generateMove() {
    state = fenToOneHot();
    input = tf.expandDims(state, axis = 0);
    const model = await tf.loadGraphModel('jsModel/model.json');
    output = model.predict(input);
    outputArray = output.arraySync()[0];
    moveInteger = argmax(outputArray);
    console.log(moveInteger);
    startingSquare = Math.floor(moveInteger / 64);
    endingSquare = moveInteger % 64;
    return [startingSquare, endingSquare];
}

function argmax(array) {
    let maxIndex = 0;
    let maxValue = array[0];

    for (let i = 1; i < array.length; i++) {
        console.log(i);
        if (array[i] > maxValue) {
            maxIndex = i;
            maxValue = array[i];
        }
    }

    return maxIndex;
}

function argmax(array) {
    let maxIndex = 0;
    let maxValue = array[0];

    for (let i = 1; i < array.length; i++) {
        if (array[i] > maxValue) {
            maxValue = array[i];
            maxIndex = i;
        }
    }

    return maxIndex;
}

function resetBoard() {
    //board.start();
    move = generateMove().then(
        function(value) {
            console.log("starting square: ", value[0]);
            console.log("starting square: ", value[1]);
        },
        function(error) {
            console.log(error);
            updateOutputMessage(error);
        }
    );
}

function updateOutputMessage(newMessage) {
    document.getElementById("output").innerHTML = newMessage;
}

function onDrop(source, target, piece, newPos, oldPos, orientation) {

    if (Chessboard.objToFen(newPos) == Chessboard.objToFen(oldPos)) {
        console.log("ignore drag drop - same position");
        return;
    }
    console.log("dropped piece");
}