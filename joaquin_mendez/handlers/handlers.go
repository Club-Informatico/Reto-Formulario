package handlers

import (
	"log"

	"github.com/gin-gonic/gin"
	db "github.com/juackomdz/reto-formulario/database"
	"github.com/juackomdz/reto-formulario/models"
	_ "github.com/juackomdz/reto-formulario/models"
)

func Post_users(ctx *gin.Context) {

	var dto models.UserDTO

	if err := ctx.ShouldBind(&dto); err != nil {
		log.Fatalln("error al bindiar=", err)
	}

	sql := "INSERT INTO usersTest (nombre,rut,fecha_nacimiento,telefono,email) VALUES (?1,?2,?3,?4,?5)"

	_, err := db.Conectar().Exec(sql, dto.Nombre, dto.Rut, dto.FechaNacimiento, dto.Telefono, dto.Email)
	if err != nil {
		log.Fatalln("error1=", err)
	}

	htmlRes := "creado"
	ctx.String(200, htmlRes)
}

func Get_users(ctx *gin.Context) {

	ctx.String(200, "usuarios")
}
