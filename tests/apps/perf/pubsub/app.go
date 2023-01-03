package main

import (
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
)

func main() {
	r := mux.NewRouter()
	httpServer := &http.Server{
		Addr:    ":3000",
		Handler: r,
	}
	r.HandleFunc("/orders", subscribeHandler).Methods("POST")

	fmt.Println("Starting HTTP Server")
	if err := httpServer.ListenAndServe(); err != nil {
		fmt.Println("Error starting http server:", err)
	}
}

func subscribeHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Got value!")
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"status": "SUCCESS"}`))
}