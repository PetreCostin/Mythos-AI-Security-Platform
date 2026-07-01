package handlers

import (
	"context"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/mythos-ai/security-platform/backend/internal/models"
	"github.com/mythos-ai/security-platform/backend/internal/services"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type CVEHandler struct {
	db      *gorm.DB
	service *services.CVEService
	logger  *zap.Logger
}

func NewCVEHandler(db *gorm.DB, service *services.CVEService, logger *zap.Logger) *CVEHandler {
	return &CVEHandler{db: db, service: service, logger: logger}
}

func (h *CVEHandler) Search(c *gin.Context) {
	page := parseInt(c.DefaultQuery("page", "1"), 1)
	results, total, err := h.service.Search(strings.TrimSpace(c.Query("q")), strings.TrimSpace(c.Query("severity")), page, 20)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to search cves"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": results, "page": page, "total": total})
}

func (h *CVEHandler) Detail(c *gin.Context) {
	var cve models.CVE
	if err := h.db.First(&cve, "id = ? OR cve_id = ?", c.Param("id"), c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "cve not found"})
		return
	}
	c.JSON(http.StatusOK, cve)
}

func (h *CVEHandler) Recent(c *gin.Context) {
	var cves []models.CVE
	if err := h.db.Where("severity = ?", "CRITICAL").Order("published_date desc").Limit(10).Find(&cves).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch recent cves"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": cves})
}

func (h *CVEHandler) Sync(c *gin.Context) {
	go func() {
		if err := h.service.SyncFromNVD(context.Background()); err != nil && h.logger != nil {
			h.logger.Warn("cve sync failed", zap.Error(err))
		}
	}()
	c.JSON(http.StatusAccepted, gin.H{"message": "cve sync started"})
}
