package database

import (
	"database/sql"
	"fmt"
	"os"

	_ "github.com/glebarez/go-sqlite"
)

func Conectar() *sql.DB {

	sqldb, err := sql.Open("sqlite", "file:local.db")
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to open db %s", err)
		os.Exit(1)
	}

	_, err = sqldb.Exec("CREATE TABLE IF NOT EXISTS usersTest (id INTEGER PRIMARY KEY AUTOINCREMENT, nombre TEXT, rut TEXT, fecha_nacimiento DATETIME, telefono TEXT, email TEXT)")
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to execute query: %v\n", err)
		os.Exit(1)
	}

	return sqldb
}
