package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
    "os/exec"
	"strings"

	"github.com/gorilla/websocket"
)

func main(){
	fmt.Println("main--")

	mux := http.NewServeMux()
	mux.Handle("/", http.FileServer(http.Dir(".")))
    port := os.Getenv("PORT")
    if port == "" {
            port = "8080"
            log.Printf("defaulting to port %s", port)
    } else {
        log.Printf("port: %v", port)
    }

	server := http.Server{
		Addr: ":" + port,
		Handler: mux,
	}

	mux.HandleFunc("/ws", wsEndpoint)
	//err := server.ListenAndServeTLS("server.crt", "server.key")
	err := server.ListenAndServe()
    log.Fatal(err)
}

func wsEndpoint(w http.ResponseWriter, r *http.Request) {
    upgrader.CheckOrigin = func(r *http.Request) bool { return true }

    ws, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        log.Println(err)
    }

    log.Println("Client Connected")
    err = ws.WriteMessage(1, []byte("Hi Client!"))
    if err != nil {
        log.Println(err)
    }
    
    for {
        _, p, err := ws.ReadMessage()
        if err != nil {
            fmt.Println(err)
            return
        }

        pString := string(p)
        fmt.Println(pString)
        splitStrings := strings.Split(pString, " ")


        if splitStrings[0] == "userSentNewPosition" {
            recievedPosition(ws, splitStrings[1])
        } else {
            fmt.Println("shit dammit missed something")
        }
    }
}

var upgrader = websocket.Upgrader{
    ReadBufferSize:  1024,
    WriteBufferSize: 1024,
}

func recievedPosition(ws *websocket.Conn, fenString string) {
    fmt.Println("recieved chess position: ", fenString)
    out, err := exec.Command("/bin/python3", "myPythonFile.py", fenString).Output()
    if err != nil {
        fmt.Println("shit fucked up when calculating new position")
        sendMessage(ws, "error calculating position")
        fmt.Println(err)
        return
    }
    fenAfterCalculation := string([]byte(out))
    sendNewPosition(ws, fenAfterCalculation)
}

func sendMessage(ws *websocket.Conn, msg string) {
    err := ws.WriteMessage(1, []byte(msg))
    if err != nil {
        fmt.Println(err)
        return
    }
}

func sendNewPosition(ws *websocket.Conn, fenString string) {
    sendMessage(ws, "updatePosition " + fenString)
}