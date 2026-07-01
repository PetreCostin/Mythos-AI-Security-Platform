package services

import (
	"strings"

	"github.com/mythos-ai/security-platform/backend/internal/models"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type ThreatService struct {
	db        *gorm.DB
	logger    *zap.Logger
	technique map[string]string
}

func NewThreatService(db *gorm.DB, logger *zap.Logger) *ThreatService {
	return &ThreatService{
		db:     db,
		logger: logger,
		technique: map[string]string{
			"T1059.001": "PowerShell",
			"T1078":     "Valid Accounts",
			"T1566.001": "Spearphishing Attachment",
			"T1105":     "Ingress Tool Transfer",
			"T1190":     "Exploit Public-Facing Application",
		},
	}
}

func (s *ThreatService) LookupTechnique(id string) string {
	if value, ok := s.technique[strings.ToUpper(id)]; ok {
		return value
	}
	return "Unknown technique"
}

func (s *ThreatService) EnrichIOC(ioc *models.IOC) *models.ThreatIntel {
	var threat models.ThreatIntel
	err := s.db.Where("LOWER(campaign) LIKE ? OR LOWER(description) LIKE ?", "%"+strings.ToLower(ioc.ThreatType)+"%", "%"+strings.ToLower(ioc.ThreatType)+"%").First(&threat).Error
	if err != nil {
		if s.logger != nil && err != gorm.ErrRecordNotFound {
			s.logger.Warn("threat enrichment query failed", zap.Error(err))
		}
		return nil
	}
	return &threat
}
