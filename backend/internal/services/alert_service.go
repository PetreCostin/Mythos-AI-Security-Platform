package services

import (
	"fmt"
	"time"

	"github.com/mythos-ai/security-platform/backend/internal/models"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type AlertService struct {
	db     *gorm.DB
	logger *zap.Logger
}

func NewAlertService(db *gorm.DB, logger *zap.Logger) *AlertService {
	return &AlertService{db: db, logger: logger}
}

func (s *AlertService) CreateAlert(alert *models.Alert) error {
	if err := s.db.Create(alert).Error; err != nil {
		return err
	}

	if err := s.autoCorrelate(alert); err != nil && s.logger != nil {
		s.logger.Warn("auto-correlation failed", zap.Error(err), zap.String("alert_id", alert.ID.String()))
	}

	return nil
}

func (s *AlertService) autoCorrelate(alert *models.Alert) error {
	if alert.Severity != "CRITICAL" && alert.Severity != "HIGH" {
		return nil
	}

	var existing models.Incident
	err := s.db.Where("title = ? AND status IN ?", fmt.Sprintf("Correlated %s activity", alert.Source), []string{"NEW", "INVESTIGATING", "CONTAINED"}).First(&existing).Error
	if err == nil {
		return s.db.Model(&existing).Association("Alerts").Append(alert)
	}
	if err != nil && err != gorm.ErrRecordNotFound {
		return err
	}

	timeline := []models.TimelineEntry{{
		Timestamp: time.Now(),
		Author:    "mythos-ai",
		Message:   "Incident auto-created from high-fidelity alert correlation.",
	}}

	incident := models.Incident{
		Title:       fmt.Sprintf("Correlated %s activity", alert.Source),
		Description: fmt.Sprintf("Auto-correlated %s alert from %s targeting %s.", alert.Severity, alert.SourceIP, alert.DestIP),
		Severity:    alert.Severity,
		Status:      "NEW",
		Timeline:    models.NewJSONB(timeline),
		AIAnalysis:  s.TriggerAIAnalysis(alert),
	}
	if err := s.db.Create(&incident).Error; err != nil {
		return err
	}
	return s.db.Model(&incident).Association("Alerts").Append(alert)
}

func (s *AlertService) TriggerAIAnalysis(alert *models.Alert) string {
	return fmt.Sprintf("AI assessment: %s alert from %s to %s matches MITRE technique %s and should be prioritized for analyst triage.", alert.Severity, alert.SourceIP, alert.DestIP, alert.MitreAttackTechnique)
}
