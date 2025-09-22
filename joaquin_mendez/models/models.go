package models

import (
	"time"
)

type User struct {
	Id              uint
	Nombre          string
	Rut             string
	FechaNacimiento time.Time
	Telefono        string
	Email           string
}
