package main

import (
	"go-auth/handlers"
	"go-auth/middleware"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		log.Fatal("JWT_SECRET not found in .env file")
	}

	http.HandleFunc("/login", handlers.LoginHandler)
	http.Handle("/secure", middleware.AuthMiddleware(http.HandlerFunc(handlers.SecureHandler)))

	log.Println("Server running on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
