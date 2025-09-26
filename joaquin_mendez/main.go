package main

import (
	"github.com/gin-gonic/gin"
	h "github.com/juackomdz/reto-formulario/handlers"
)

func main() {
	g := gin.Default()

	g.Static("/static", "./static")

	route := g.Group("/api/v1")
	route.POST("/users", h.Post_users)
	route.GET("/users", h.Get_users)

	g.Run(":3000")
}
