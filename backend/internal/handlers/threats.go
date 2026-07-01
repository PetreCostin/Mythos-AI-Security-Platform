package handlers

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/mythos-ai/security-platform/backend/internal/models"
	"github.com/mythos-ai/security-platform/backend/internal/services"
	"gorm.io/gorm"
)

type ThreatHandler struct {
	db      *gorm.DB
	service *services.ThreatService
}

func NewThreatHandler(db *gorm.DB, service *services.ThreatService) *ThreatHandler {
	return &ThreatHandler{db: db, service: service}
}

func (h *ThreatHandler) List(c *gin.Context) {
	var threats []models.ThreatIntel
	if err := h.db.Order("created_at desc").Find(&threats).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch threat intel"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": threats})
}

func (h *ThreatHandler) Detail(c *gin.Context) {
	var threat models.ThreatIntel
	if err := h.db.First(&threat, "id = ?", c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "threat intel not found"})
		return
	}
	c.JSON(http.StatusOK, threat)
}

func (h *ThreatHandler) Search(c *gin.Context) {
	search := strings.ToLower(strings.TrimSpace(c.Query("q")))
	technique := strings.TrimSpace(c.Query("technique"))
	query := h.db.Model(&models.ThreatIntel{})
	if search != "" {
		like := "%" + search + "%"
		query = query.Where("LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR LOWER(threat_actor) LIKE ?", like, like, like)
	}
	if technique != "" {
		query = query.Where("mitre_attack_techniques::text ILIKE ?", "%"+technique+"%")
	}

	var threats []models.ThreatIntel
	if err := query.Order("created_at desc").Find(&threats).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to search threat intel"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": threats, "techniqueName": h.service.LookupTechnique(technique)})
}
