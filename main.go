package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
)

func main(){
	fmt.Println("main")

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

	err := server.ListenAndServe()
    log.Fatal(err)
}
