package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type IOC struct {
	ID         uuid.UUID  `gorm:"type:uuid;primaryKey" json:"id"`
	Type       string     `gorm:"size:20;index;not null" json:"type"`
	Value      string     `gorm:"uniqueIndex;not null" json:"value"`
	ThreatType string     `gorm:"index" json:"threatType"`
	Confidence int        `json:"confidence"`
	Source     string     `json:"source"`
	Tags       JSONB      `gorm:"type:jsonb" json:"tags"`
	FirstSeen  *time.Time `json:"firstSeen,omitempty"`
	LastSeen   *time.Time `json:"lastSeen,omitempty"`
	Active     bool       `gorm:"default:true" json:"active"`
	CreatedAt  time.Time  `json:"createdAt"`
	UpdatedAt  time.Time  `json:"updatedAt"`
}

func (i *IOC) BeforeCreate(tx *gorm.DB) error {
	if i.ID == uuid.Nil {
		i.ID = uuid.New()
	}
	return nil
}
