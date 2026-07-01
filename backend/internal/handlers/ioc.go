package handlers

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/mythos-ai/security-platform/backend/internal/models"
	"gorm.io/gorm"
)

type IOCHandler struct {
	db *gorm.DB
}

func NewIOCHandler(db *gorm.DB) *IOCHandler {
	return &IOCHandler{db: db}
}

func (h *IOCHandler) Search(c *gin.Context) {
	query := h.db.Model(&models.IOC{})
	if value := strings.ToLower(strings.TrimSpace(c.Query("value"))); value != "" {
		like := "%" + value + "%"
		query = query.Where("LOWER(value) LIKE ?", like)
	}
	if iocType := strings.TrimSpace(c.Query("type")); iocType != "" {
		query = query.Where("type = ?", iocType)
	}

	var iocs []models.IOC
	if err := query.Order("updated_at desc").Find(&iocs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to search iocs"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": iocs})
}

func (h *IOCHandler) Create(c *gin.Context) {
	var ioc models.IOC
	if err := c.ShouldBindJSON(&ioc); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.db.Create(&ioc).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create ioc"})
		return
	}
	c.JSON(http.StatusCreated, ioc)
}

func (h *IOCHandler) Detail(c *gin.Context) {
	var ioc models.IOC
	if err := h.db.First(&ioc, "id = ?", c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ioc not found"})
		return
	}
	c.JSON(http.StatusOK, ioc)
}

func (h *IOCHandler) Update(c *gin.Context) {
	var req models.IOC
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	result := h.db.Model(&models.IOC{}).Where("id = ?", c.Param("id")).Updates(req)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update ioc"})
		return
	}
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "ioc not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "ioc updated"})
}

func (h *IOCHandler) Deactivate(c *gin.Context) {
	result := h.db.Model(&models.IOC{}).Where("id = ?", c.Param("id")).Updates(map[string]any{"active": false})
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to deactivate ioc"})
		return
	}
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "ioc not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "ioc deactivated"})
}
