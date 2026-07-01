package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ThreatIntel struct {
	ID                    uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	Name                  string    `gorm:"not null" json:"name"`
	ThreatActor           string    `json:"threatActor"`
	Campaign              string    `json:"campaign"`
	MitreAttackTechniques JSONB     `gorm:"type:jsonb" json:"mitreAttackTechniques"`
	TTPs                  JSONB     `gorm:"type:jsonb" json:"ttps"`
	Description           string    `gorm:"type:text" json:"description"`
	Severity              string    `gorm:"size:20;index" json:"severity"`
	CreatedAt             time.Time `json:"createdAt"`
}

func (t *ThreatIntel) BeforeCreate(tx *gorm.DB) error {
	if t.ID == uuid.Nil {
		t.ID = uuid.New()
	}
	if t.CreatedAt.IsZero() {
		t.CreatedAt = time.Now()
	}
	return nil
}
