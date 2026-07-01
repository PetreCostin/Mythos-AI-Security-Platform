package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/mythos-ai/security-platform/backend/internal/models"
	"gorm.io/gorm"
)

type DashboardHandler struct {
	db *gorm.DB
}

func NewDashboardHandler(db *gorm.DB) *DashboardHandler {
	return &DashboardHandler{db: db}
}

func (h *DashboardHandler) Stats(c *gin.Context) {
	var totalAlerts int64
	var activeIncidents int64
	var cvesToday int64
	var threatsBlocked int64
	var recentAlerts []models.Alert
	var severityRows []struct {
		Severity string
		Count    int64
	}
	var dayRows []struct {
		Day   string
		Count int64
	}

	if err := h.db.Model(&models.Alert{}).Count(&totalAlerts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to count alerts"})
		return
	}
	_ = h.db.Model(&models.Incident{}).Where("status IN ?", []string{"NEW", "INVESTIGATING", "CONTAINED"}).Count(&activeIncidents).Error
	_ = h.db.Model(&models.CVE{}).Where("DATE(published_date) = CURRENT_DATE").Count(&cvesToday).Error
	_ = h.db.Model(&models.IOC{}).Where("active = ?", false).Count(&threatsBlocked).Error
	_ = h.db.Order("created_at desc").Limit(5).Find(&recentAlerts).Error
	_ = h.db.Model(&models.Alert{}).Select("severity, count(*) as count").Group("severity").Scan(&severityRows).Error
	_ = h.db.Raw("SELECT TO_CHAR(DATE(created_at), 'YYYY-MM-DD') AS day, COUNT(*) AS count FROM alerts GROUP BY DATE(created_at) ORDER BY DATE(created_at) DESC LIMIT 7").Scan(&dayRows).Error

	alertsBySeverity := map[string]int64{}
	for _, row := range severityRows {
		alertsBySeverity[row.Severity] = row.Count
	}

	c.JSON(http.StatusOK, gin.H{
		"totalAlerts":      totalAlerts,
		"activeIncidents":  activeIncidents,
		"cvesToday":        cvesToday,
		"threatsBlocked":   threatsBlocked,
		"alertsByDay":      dayRows,
		"alertsBySeverity": alertsBySeverity,
		"recentAlerts":     recentAlerts,
	})
}
