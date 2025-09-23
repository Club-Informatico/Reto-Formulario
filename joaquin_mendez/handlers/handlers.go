package handlers

import (
	"fmt"
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

	htmlRes := `
	Usuario creado con exito.
	`
	ctx.String(200, htmlRes)
}

func Get_users(ctx *gin.Context) {

	rows, err := db.Conectar().Query("SELECT * FROM usersTest")
	if err != nil {
		log.Fatalln(err)
	}

	/*
			htmlHead := `
		        	<table>
		            	<tr>
		                	<th>Id</th>
		                	<th>Nombre</th>
							<th>Rut</th>
							<th>Fecha Nacimiento</th>
							<th>Telefono</th>
							<th>Email</th>
		            	</tr>
				`
	*/
	for rows.Next() {
		var data models.User
		err := rows.Scan(&data.Id, &data.Nombre, &data.Rut, &data.FechaNacimiento, &data.Telefono, &data.Email)
		if err != nil {
			log.Fatalln(err)
		}

		htmlRes := fmt.Sprintln("id=", data.Nombre)
		ctx.String(200, htmlRes)

		/*
					var htmlBody = `
						<tr>
			               	<td>` + strconv.Itoa(data.Id) + `</td>
			               	<td>` + data.Nombre + `</td>
							<td>` + data.Rut + `</td>
							<td>` + data.FechaNacimiento.Format("02-10-2006") + `</td>
							<td>` + data.Telefono + `</td>
							<td>` + data.Email + `</td>
			            </tr>
					`
					htmla := "</table>"
					ctx.String(200, htmlHead+htmlBody+htmla)
		*/

	}
}
