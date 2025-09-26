FROM golang:1.24-alpine AS build

WORKDIR /app

COPY . /app/

RUN go build

FROM alpine

WORKDIR /app

COPY --from=build /app  /app

EXPOSE 3000

CMD [ "./reto-formulario" ]
