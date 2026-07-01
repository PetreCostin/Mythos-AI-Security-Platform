package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/mythos-ai/security-platform/backend/internal/config"
	"github.com/mythos-ai/security-platform/backend/internal/models"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type IncidentHandler struct {
	db     *gorm.DB
	cfg    *config.Config
	logger *zap.Logger
	client *http.Client
}

func NewIncidentHandler(db *gorm.DB, cfg *config.Config, logger *zap.Logger) *IncidentHandler {
	return &IncidentHandler{db: db, cfg: cfg, logger: logger, client: &http.Client{Timeout: 15 * time.Second}}
}

type incidentRequest struct {
	Title       string      `json:"title"`
	Description string      `json:"description"`
	Severity    string      `json:"severity"`
	Status      string      `json:"status"`
	AssignedTo  *uuid.UUID  `json:"assignedTo"`
	AlertIDs    []uuid.UUID `json:"alertIds"`
}

func (h *IncidentHandler) List(c *gin.Context) {
	var incidents []models.Incident
	if err := h.db.Preload("Alerts").Preload("AssignedUser").Order("created_at desc").Find(&incidents).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch incidents"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": incidents})
}

func (h *IncidentHandler) Create(c *gin.Context) {
	var req incidentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	incident := models.Incident{
		Title:       req.Title,
		Description: req.Description,
		Severity:    req.Severity,
		Status:      req.Status,
		AssignedTo:  req.AssignedTo,
		Timeline:    models.NewJSONB([]models.TimelineEntry{}),
	}
	if err := h.db.Create(&incident).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create incident"})
		return
	}
	if err := h.attachAlerts(&incident, req.AlertIDs); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to associate alerts"})
		return
	}
	c.JSON(http.StatusCreated, incident)
}

func (h *IncidentHandler) Detail(c *gin.Context) {
	var incident models.Incident
	if err := h.db.Preload("Alerts").Preload("AssignedUser").First(&incident, "id = ?", c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "incident not found"})
		return
	}
	c.JSON(http.StatusOK, incident)
}

func (h *IncidentHandler) Update(c *gin.Context) {
	var req incidentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updates := map[string]any{
		"title":       req.Title,
		"description": req.Description,
		"severity":    req.Severity,
		"status":      req.Status,
		"assigned_to": req.AssignedTo,
	}
	if req.Status == "RESOLVED" || req.Status == "CLOSED" {
		updates["resolved_at"] = time.Now()
	}

	result := h.db.Model(&models.Incident{}).Where("id = ?", c.Param("id")).Updates(updates)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update incident"})
		return
	}
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "incident not found"})
		return
	}

	var incident models.Incident
	if err := h.db.Preload("Alerts").First(&incident, "id = ?", c.Param("id")).Error; err == nil {
		_ = h.attachAlerts(&incident, req.AlertIDs)
	}

	c.JSON(http.StatusOK, gin.H{"message": "incident updated"})
}

func (h *IncidentHandler) AddTimelineEntry(c *gin.Context) {
	var incident models.Incident
	if err := h.db.First(&incident, "id = ?", c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "incident not found"})
		return
	}

	var entry models.TimelineEntry
	if err := c.ShouldBindJSON(&entry); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if entry.Timestamp.IsZero() {
		entry.Timestamp = time.Now()
	}

	timeline := []models.TimelineEntry{}
	if len(incident.Timeline) > 0 {
		_ = json.Unmarshal(incident.Timeline, &timeline)
	}
	timeline = append(timeline, entry)

	if err := h.db.Model(&incident).Update("timeline", models.NewJSONB(timeline)).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to append timeline entry"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "timeline updated", "timeline": timeline})
}

func (h *IncidentHandler) GetPlaybook(c *gin.Context) {
	var incident models.Incident
	if err := h.db.First(&incident, "id = ?", c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "incident not found"})
		return
	}

	if incident.Playbook == "" {
		incident.Playbook = h.generatePlaybook(&incident)
		_ = h.db.Model(&incident).Update("playbook", incident.Playbook).Error
	}

	c.JSON(http.StatusOK, gin.H{"incidentId": incident.ID, "playbook": incident.Playbook})
}

func (h *IncidentHandler) attachAlerts(incident *models.Incident, alertIDs []uuid.UUID) error {
	if len(alertIDs) == 0 {
		return nil
	}
	var alerts []models.Alert
	if err := h.db.Where("id IN ?", alertIDs).Find(&alerts).Error; err != nil {
		return err
	}
	if len(alerts) == 0 {
		return nil
	}
	return h.db.Model(incident).Association("Alerts").Replace(alerts)
}

func (h *IncidentHandler) generatePlaybook(incident *models.Incident) string {
	if h.cfg.AIServiceURL != "" {
		payload, _ := json.Marshal(gin.H{"title": incident.Title, "severity": incident.Severity, "description": incident.Description})
		req, err := http.NewRequest(http.MethodPost, h.cfg.AIServiceURL+"/playbook", bytes.NewReader(payload))
		if err == nil {
			req.Header.Set("Content-Type", "application/json")
			resp, err := h.client.Do(req)
			if err == nil {
				defer resp.Body.Close()
				var response struct {
					Playbook string `json:"playbook"`
				}
				if resp.StatusCode < 300 && json.NewDecoder(resp.Body).Decode(&response) == nil && response.Playbook != "" {
					return response.Playbook
				}
			}
		}
	}

	return fmt.Sprintf(`1. Confirm scope of %s
2. Isolate affected assets
3. Collect volatile evidence
4. Rotate exposed credentials
5. Validate eradication and recovery`, incident.Title)
}
