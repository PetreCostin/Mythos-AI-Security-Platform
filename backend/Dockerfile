FROM golang:1.25-alpine AS builder
WORKDIR /app
RUN apk add --no-cache git
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/server ./cmd/server

FROM alpine:3.19
WORKDIR /app
RUN adduser -D mythos
COPY --from=builder /app/server /app/server
COPY .env.example /app/.env.example
EXPOSE 8080
USER mythos
ENTRYPOINT ["/app/server"]
