package models

type User struct {
	Username string
	Password string
	Role     string
}

type Credentials struct {
	Username string `json:"username"`
	Password string `json:"password"`
}
