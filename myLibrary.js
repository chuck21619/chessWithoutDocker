
const pieces = { 'p': 0, 'n': 1, 'b': 2, 'r': 3, 'q': 4, 'k': 5, 'P': 6, 'N': 7, 'B': 8, 'R': 9, 'Q': 10, 'K': 11 };
const files = {0: 'a', 1: 'b', 2: 'c', 3: 'd', 4: 'e', 5: 'f', 6: 'g', 7: 'h'};
var board;
var config = {
    position: 'start',
    onDrop: onDrop,
    draggable: true
}

function onLoad() {
    console.log('onLoad()');
    board = Chessboard('myBoard', config);
    document.getElementById("resetBoard").onclick = resetBoard;
}

function fenToOneHot() {
    fen = board.fen();
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
    //TODO: handle both sides
    //always assuming the computer is playing as black for now
    oneHotBoard.push(0); // 0 is blacks turn, 1 is whites turn
    return oneHotBoard;
}

async function generateMove() {
    
    state = fenToOneHot();
    input = tf.expandDims(state, axis = 0);
    const model = await tf.loadGraphModel('jsModel/model.json');
    output = model.predict(input);
    outputArray = output.arraySync()[0];
    moveInteger = argmax(outputArray);
    data = output.dataSync();
    squares = squaresFromMoveInt(moveInteger);
    return squares;
}

function squaresFromMoveInt(moveInteger) {
    console.log(moveInteger);
    startingSquare = Math.floor(moveInteger / 64);
    endingSquare = moveInteger % 64;
    return [startingSquare, endingSquare]
}
    

function argmax(array) {
    let maxIndex = 0;
    let maxValue = array[0];

    for (let i = 1; i < array.length; i++) {
        if (array[i] > maxValue) {
            maxIndex = i;
            maxValue = array[i];
        }
    }

    return maxIndex;
}

function resetBoard() {
    board.start();
}

function chessSquareFromInt(integerSquare) {
    rank = Math.floor(integerSquare / 8)+1;
    fileInt = (integerSquare % 8);
    fileLetter = files[fileInt];
    return fileLetter + rank.toString()
}

function updateOutputMessage(newMessage) {
    document.getElementById("output").innerHTML = newMessage;
}

function onDrop(source, target, piece, newPos, oldPos, orientation) {

    if (Chessboard.objToFen(newPos) == Chessboard.objToFen(oldPos)) {
        console.log("ignore drag drop - same position");
        return;
    }
    updateOutputMessage("calculating...")

    move = generateMove().then(
        function (value) {
            moveString = chessSquareFromInt(value[0]) + "-" + chessSquareFromInt(value[1]);
            updateOutputMessage(moveString);
            board.move(moveString);
        },
        function (error) {
            console.log(error);
            updateOutputMessage(error);
        }
    );
}