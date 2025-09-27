package models

import "time"

type UserDTO struct {
	Nombre          string     `form:"nombre"`
	Rut             string     `form:"rut"`
	FechaNacimiento *time.Time `form:"fecha_nacimiento" time_format:"02-01-2006"`
	Telefono        string     `form:"telefono"`
	Email           string     `form:"email"`
}
