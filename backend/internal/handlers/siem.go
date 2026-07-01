package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/mythos-ai/security-platform/backend/internal/models"
	"github.com/mythos-ai/security-platform/backend/internal/services"
	"gorm.io/gorm"
)

type SIEMHandler struct {
	db      *gorm.DB
	service *services.AlertService
	hub     *Hub
}

type siemEvent struct {
	Title                string `json:"title"`
	Description          string `json:"description"`
	Severity             string `json:"severity"`
	Status               string `json:"status"`
	Source               string `json:"source"`
	SourceIP             string `json:"sourceIp"`
	DestIP               string `json:"destIp"`
	Protocol             string `json:"protocol"`
	Port                 int    `json:"port"`
	RawLog               string `json:"rawLog"`
	MitreAttackTechnique string `json:"mitreAttackTechnique"`
}

func NewSIEMHandler(db *gorm.DB, service *services.AlertService, hub *Hub) *SIEMHandler {
	return &SIEMHandler{db: db, service: service, hub: hub}
}

func (h *SIEMHandler) Ingest(c *gin.Context) {
	raw, err := c.GetRawData()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to read payload"})
		return
	}

	var wrapped struct {
		Events []siemEvent `json:"events"`
	}
	events := []siemEvent{}
	if err := json.Unmarshal(raw, &wrapped); err == nil && len(wrapped.Events) > 0 {
		events = wrapped.Events
	} else if err := json.Unmarshal(raw, &events); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid ingest payload"})
		return
	}

	created := make([]models.Alert, 0, len(events))
	for index, event := range events {
		alert := models.Alert{
			Title:                defaultString(event.Title, fmt.Sprintf("SIEM Event %d", index+1)),
			Description:          defaultString(event.Description, "Bulk-ingested from external SIEM source."),
			Severity:             defaultString(event.Severity, "MEDIUM"),
			Status:               defaultString(event.Status, "NEW"),
			Source:               defaultString(event.Source, "External SIEM"),
			SourceIP:             event.SourceIP,
			DestIP:               event.DestIP,
			Protocol:             event.Protocol,
			Port:                 event.Port,
			RawLog:               event.RawLog,
			MitreAttackTechnique: event.MitreAttackTechnique,
			CreatedAt:            time.Now(),
		}
		if err := h.service.CreateAlert(&alert); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to ingest alerts"})
			return
		}
		created = append(created, alert)
		h.hub.BroadcastJSON(gin.H{"type": "alert_ingested", "alert": alert})
	}

	c.JSON(http.StatusCreated, gin.H{"ingested": len(created), "alerts": created})
}

func (h *SIEMHandler) Sources(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"data": []gin.H{
		{"name": "Microsoft Sentinel", "type": "cloud", "status": "connected"},
		{"name": "Wazuh", "type": "endpoint", "status": "connected"},
		{"name": "Splunk Enterprise Security", "type": "siem", "status": "configured"},
	}})
}

func defaultString(value, fallback string) string {
	if value == "" {
		return fallback
	}
	return value
}
