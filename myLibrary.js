
var board;
var config = {
    position: 'start',
    onDrop: onDrop,
    draggable: true
}

var socket;

function onLoad() {
    document.location.host
    //TODO: ws if running locally. wss when building container to be hosted on service that manages TLS
    //socket = new WebSocket("ws://" + document.location.host + "/ws");
    socket = new WebSocket("wss://" + document.location.host + "/ws");
    
    socket.onopen = () => {
        console.log("Successfully Connected");
    };
    
    socket.onclose = event => {
        console.log("Socket Closed Connection: ", event);
        socket.send("Client Closed!")
    };
    
    socket.onmessage = event => {
        console.log("message event: ", event.data);
        stringData = String(event.data);
        if (stringData.includes("no matching legal move")) {
            updateOutputMessage("model failed to calculate new position");
            return;
        }
        updateOutputMessage("");

        splitString = stringData.split(" ");
        if (splitString[0] == "updatePosition") {
            console.log('updating position');
            fenString = splitString[1];
            board.position(fenString);
        }
    };

    socket.onerror = error => {
        console.log("Socket Error: ", error);
    };
    
    board = Chessboard('myBoard', config);
    document.getElementById("resetBoard").onclick = resetBoard;
}

function resetBoard() {
    board.start();
    updateOutputMessage("");
}

function sendPosition(fenString) {
    console.log("sendPosition " + fenString);
    socket.send("userSentNewPosition " + fenString);
    updateOutputMessage("calculating move...");
}

function updateOutputMessage(newMessage) {
    document.getElementById("output").innerHTML = newMessage;
}

function onDrop (source, target, piece, newPos, oldPos, orientation) {

    if (Chessboard.objToFen(newPos) == Chessboard.objToFen(oldPos)) {
        console.log("ignore drag drop - same position");
        return;
    }
    sendPosition(Chessboard.objToFen(newPos));
}