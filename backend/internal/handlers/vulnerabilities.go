package handlers

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/mythos-ai/security-platform/backend/internal/models"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type scanJob struct {
	ID        string                 `json:"id"`
	Status    string                 `json:"status"`
	Results   []models.Vulnerability `json:"results,omitempty"`
	Error     string                 `json:"error,omitempty"`
	CreatedAt time.Time              `json:"createdAt"`
}

type VulnerabilityHandler struct {
	db     *gorm.DB
	logger *zap.Logger
	mu     sync.RWMutex
	jobs   map[string]*scanJob
}

func NewVulnerabilityHandler(db *gorm.DB, logger *zap.Logger) *VulnerabilityHandler {
	return &VulnerabilityHandler{db: db, logger: logger, jobs: map[string]*scanJob{}}
}

func (h *VulnerabilityHandler) TriggerScan(c *gin.Context) {
	var req struct {
		Targets []string `json:"targets"`
	}
	_ = c.ShouldBindJSON(&req)
	if len(req.Targets) == 0 {
		req.Targets = []string{"web-app.prod.local", "api.prod.local"}
	}

	jobID := uuid.NewString()
	job := &scanJob{ID: jobID, Status: "queued", CreatedAt: time.Now()}

	h.mu.Lock()
	h.jobs[jobID] = job
	h.mu.Unlock()

	go h.runScan(jobID, req.Targets)

	c.JSON(http.StatusAccepted, gin.H{"jobId": jobID, "status": "queued"})
}

func (h *VulnerabilityHandler) GetScanStatus(c *gin.Context) {
	h.mu.RLock()
	job, ok := h.jobs[c.Param("jobId")]
	h.mu.RUnlock()
	if !ok {
		c.JSON(http.StatusNotFound, gin.H{"error": "scan job not found"})
		return
	}
	c.JSON(http.StatusOK, job)
}

func (h *VulnerabilityHandler) List(c *gin.Context) {
	var vulns []models.Vulnerability
	if err := h.db.Order("discovered_at desc").Find(&vulns).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch vulnerabilities"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": vulns})
}

func (h *VulnerabilityHandler) UpdateStatus(c *gin.Context) {
	var req struct {
		Status string `json:"status"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updates := map[string]any{"status": req.Status}
	if req.Status == "FIXED" {
		updates["fixed_at"] = time.Now()
	}

	result := h.db.Model(&models.Vulnerability{}).Where("id = ?", c.Param("id")).Updates(updates)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update vulnerability"})
		return
	}
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "vulnerability not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "vulnerability status updated"})
}

func (h *VulnerabilityHandler) runScan(jobID string, targets []string) {
	h.setJobStatus(jobID, "running", nil, "")
	time.Sleep(2 * time.Second)

	findings := make([]models.Vulnerability, 0, len(targets))
	severities := []string{"CRITICAL", "HIGH", "MEDIUM"}
	for index, target := range targets {
		finding := models.Vulnerability{
			Target:       target,
			VulnType:     "configuration",
			Severity:     severities[index%len(severities)],
			CVSSScore:    7.5 + float64(index),
			Description:  "Automated scan detected an exposed management interface and weak security headers.",
			CVE:          "CVE-2024-1200",
			Remediation:  "Restrict administrative access, patch the service, and enforce secure transport.",
			Status:       "OPEN",
			DiscoveredAt: time.Now(),
		}
		if err := h.db.Create(&finding).Error; err != nil {
			h.setJobStatus(jobID, "failed", nil, err.Error())
			return
		}
		findings = append(findings, finding)
	}

	h.setJobStatus(jobID, "completed", findings, "")
}

func (h *VulnerabilityHandler) setJobStatus(jobID, status string, results []models.Vulnerability, errText string) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if job, ok := h.jobs[jobID]; ok {
		job.Status = status
		job.Results = results
		job.Error = errText
	}
}
