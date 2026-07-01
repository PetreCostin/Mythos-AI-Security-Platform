package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"go.uber.org/zap"
)

type Hub struct {
	clients    map[*websocket.Conn]bool
	register   chan *websocket.Conn
	unregister chan *websocket.Conn
	broadcast  chan []byte
	logger     *zap.Logger
}

func NewHub(logger *zap.Logger) *Hub {
	return &Hub{
		clients:    map[*websocket.Conn]bool{},
		register:   make(chan *websocket.Conn),
		unregister: make(chan *websocket.Conn),
		broadcast:  make(chan []byte, 32),
		logger:     logger,
	}
}

func (h *Hub) Run() {
	for {
		select {
		case conn := <-h.register:
			h.clients[conn] = true
		case conn := <-h.unregister:
			if _, ok := h.clients[conn]; ok {
				delete(h.clients, conn)
				_ = conn.Close()
			}
		case message := <-h.broadcast:
			for conn := range h.clients {
				if err := conn.WriteMessage(websocket.TextMessage, message); err != nil {
					delete(h.clients, conn)
					_ = conn.Close()
				}
			}
		}
	}
}

func (h *Hub) BroadcastJSON(value any) {
	payload, err := json.Marshal(value)
	if err != nil {
		if h.logger != nil {
			h.logger.Warn("failed to marshal websocket broadcast", zap.Error(err))
		}
		return
	}
	select {
	case h.broadcast <- payload:
	default:
		if h.logger != nil {
			h.logger.Warn("websocket broadcast queue full")
		}
	}
}

type WebsocketHandler struct {
	hub *Hub
}

func NewWebsocketHandler(hub *Hub) *WebsocketHandler {
	return &WebsocketHandler{hub: hub}
}

var upgrader = websocket.Upgrader{CheckOrigin: func(r *http.Request) bool { return true }}

func (h *WebsocketHandler) Serve(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to upgrade websocket"})
		return
	}

	h.hub.register <- conn
	_ = conn.WriteJSON(gin.H{"message": "connected to Mythos realtime stream"})

	go func() {
		defer func() { h.hub.unregister <- conn }()
		for {
			if _, _, err := conn.ReadMessage(); err != nil {
				return
			}
		}
	}()
}
