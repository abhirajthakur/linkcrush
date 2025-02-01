package main

import (
	"linkcrush/internal/config"
	"linkcrush/internal/handlers"
	"linkcrush/internal/middleware"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
)

func main() {
	if os.Getenv("ENVIRONMENT") != "production" {
		if err := godotenv.Load(); err != nil {
			log.Fatalf("Error loading .env file: %v", err)
		}
	}

	router := http.NewServeMux()
	db := config.SetupDatabase()
	redisClient := config.NewRedisClient()

	urlHandler := handlers.NewUrlHandler(db, redisClient)

	// router.HandleFunc("GET /{shortCode}", urlHandler.Redirect)
	router.HandleFunc("POST /shorten", urlHandler.SetShortUrl)
	router.HandleFunc("GET /shorten/{shortCode}", urlHandler.GetShortUrl)
	router.HandleFunc("GET /shorten/{shortCode}/stats", urlHandler.GetShourtUrlStats)

	server := http.Server{
		Addr:    ":" + "8080",
		Handler: middleware.EnableCors(router),
	}

	log.Printf("Server starting on %s", server.Addr)
	log.Fatal(server.ListenAndServe())
}
