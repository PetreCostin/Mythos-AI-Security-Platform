package handlers

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/mythos-ai/security-platform/backend/internal/models"
	"github.com/mythos-ai/security-platform/backend/internal/services"
	"gorm.io/gorm"
)

type AlertHandler struct {
	db      *gorm.DB
	service *services.AlertService
}

func NewAlertHandler(db *gorm.DB, service *services.AlertService) *AlertHandler {
	return &AlertHandler{db: db, service: service}
}

func (h *AlertHandler) List(c *gin.Context) {
	page := parseInt(c.DefaultQuery("page", "1"), 1)
	pageSize := parseInt(c.DefaultQuery("pageSize", "20"), 20)
	if pageSize > 100 {
		pageSize = 100
	}

	query := h.db.Model(&models.Alert{}).Preload("AssignedUser")
	if severity := strings.TrimSpace(c.Query("severity")); severity != "" {
		query = query.Where("severity = ?", severity)
	}
	if status := strings.TrimSpace(c.Query("status")); status != "" {
		query = query.Where("status = ?", status)
	}
	if search := strings.ToLower(strings.TrimSpace(c.Query("search"))); search != "" {
		like := "%" + search + "%"
		query = query.Where("LOWER(title) LIKE ? OR LOWER(description) LIKE ? OR LOWER(source) LIKE ?", like, like, like)
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to count alerts"})
		return
	}

	var alerts []models.Alert
	if err := query.Order("created_at desc").Limit(pageSize).Offset((page - 1) * pageSize).Find(&alerts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch alerts"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": alerts, "page": page, "pageSize": pageSize, "total": total})
}

func (h *AlertHandler) Detail(c *gin.Context) {
	var alert models.Alert
	if err := h.db.Preload("AssignedUser").First(&alert, "id = ?", c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "alert not found"})
		return
	}
	c.JSON(http.StatusOK, alert)
}

func (h *AlertHandler) UpdateStatus(c *gin.Context) {
	var req struct {
		Status string `json:"status"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	result := h.db.Model(&models.Alert{}).Where("id = ?", c.Param("id")).Updates(map[string]any{"status": req.Status})
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update alert"})
		return
	}
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "alert not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "alert status updated"})
}

func (h *AlertHandler) Stats(c *gin.Context) {
	var severityRows []struct {
		Severity string
		Count    int64
	}
	if err := h.db.Model(&models.Alert{}).Select("severity, count(*) as count").Group("severity").Scan(&severityRows).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to gather severity stats"})
		return
	}

	var dayRows []struct {
		Day   string
		Count int64
	}
	if err := h.db.Raw("SELECT TO_CHAR(DATE(created_at), 'YYYY-MM-DD') AS day, COUNT(*) AS count FROM alerts GROUP BY DATE(created_at) ORDER BY DATE(created_at) DESC LIMIT 14").Scan(&dayRows).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to gather daily stats"})
		return
	}

	severityCounts := map[string]int64{}
	for _, row := range severityRows {
		severityCounts[row.Severity] = row.Count
	}

	c.JSON(http.StatusOK, gin.H{"bySeverity": severityCounts, "byDay": dayRows})
}

func parseInt(raw string, fallback int) int {
	value, err := strconv.Atoi(raw)
	if err != nil || value < 1 {
		return fallback
	}
	return value
}
