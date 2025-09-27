
# Reto Formulario

🧑🏽‍💻Parte del reto de crear un formulario usando validaciones con RegEx🧑🏽‍💻

🚧Construido con tecnologías distintas a modo de probar herramientas diferentes y también sirvan de referencias para el resto.
## Features

- Creado con el lenguaje Go y framework Gin
- Validaciónes con Javascript
- Base de datos Sqlite sin ORM
- Front-end con HTMX


## Disclaimer

De momento solo estan la función de agregar y listar los usuarios. Talvez más adelante se complete con las funciones de editar y eliminar.

Mi fuerte no es el diseño, asi que los Front por favor no me linchen😅, se que el diseño no esta muy prolijo.
## Deployment

Para correr el proyecto, si tienen go instalado(versión 1.24.3 en adelante) solo basta con correr el siguiente comando:

```bash
go run .
```

Para los que no, también esta la opción de Docker:

1- Descargar Docker Desktop desde https://www.docker.com

2- Construir imagen docker
```
docker build -t reto-formulario .
```

3- Correr imagen docker
```
docker run --rm -p 3000:3000 reto-formulario
```

4- Acceder a traves de *localhost:3000/static*