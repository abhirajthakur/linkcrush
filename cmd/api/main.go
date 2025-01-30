package main

import (
	"linkcrush/internal/config"
	"linkcrush/internal/handlers"
	"log"
	"net/http"
)

func main() {
	router := http.NewServeMux()
	redisClient := config.NewRedisClient()
	db := config.SetupDatabase()

	urlHandler := handlers.NewUrlHandler(db, redisClient)

	router.HandleFunc("POST /shorten", urlHandler.SetShortUrl)
	router.HandleFunc("GET /shorten/{shortCode}", urlHandler.GetShortUrl)
	router.HandleFunc("GET /shorten/{shortCode}/stats", urlHandler.GetShourtUrlStats)

	server := http.Server{
		Addr:    ":" + "8080",
		Handler: router,
	}

	log.Printf("Server starting on %s", server.Addr)
	log.Fatal(server.ListenAndServe())
}
