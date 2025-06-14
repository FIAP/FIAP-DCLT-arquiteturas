package handlers

import (
	"encoding/json"
	"go-auth/models"
	"net/http"
	"os"
	"time"

	"github.com/dgrijalva/jwt-go"
)

var users = map[string]models.User{
	"admin":     {"admin", "admin123", "ADM"},
	"professor": {"professor", "professor123", "Professor"},
	"candidato": {"candidato", "candidato123", "candidato"},
	"empresa":   {"empresa", "empresa123", "Empresa"},
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	var creds models.Credentials
	err := json.NewDecoder(r.Body).Decode(&creds)
	if err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	user, ok := users[creds.Username]
	if !ok || user.Password != creds.Password {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"username": user.Username,
		"role":     user.Role,
		"exp":      time.Now().Add(time.Hour * 1).Unix(),
	})

	jwtSecret := os.Getenv("JWT_SECRET")
	tokenString, err := token.SignedString([]byte(jwtSecret))
	if err != nil {
		http.Error(w, "Error creating token", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"token": tokenString})
}

func SecureHandler(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("You have accessed a protected route!"))
}
