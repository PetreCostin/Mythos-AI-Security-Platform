package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Alert struct {
	ID                   uuid.UUID  `gorm:"type:uuid;primaryKey" json:"id"`
	Title                string     `gorm:"not null" json:"title"`
	Description          string     `gorm:"type:text" json:"description"`
	Severity             string     `gorm:"size:20;index;not null" json:"severity"`
	Status               string     `gorm:"size:30;index;not null;default:NEW" json:"status"`
	Source               string     `gorm:"index" json:"source"`
	SourceIP             string     `json:"sourceIp"`
	DestIP               string     `json:"destIp"`
	Protocol             string     `json:"protocol"`
	Port                 int        `json:"port"`
	RawLog               string     `gorm:"type:text" json:"rawLog"`
	MitreAttackTechnique string     `gorm:"index" json:"mitreAttackTechnique"`
	CreatedAt            time.Time  `json:"createdAt"`
	UpdatedAt            time.Time  `json:"updatedAt"`
	AssignedTo           *uuid.UUID `gorm:"type:uuid;index" json:"assignedTo,omitempty"`
	AssignedUser         *User      `gorm:"foreignKey:AssignedTo" json:"assignedUser,omitempty"`
}

func (a *Alert) BeforeCreate(tx *gorm.DB) error {
	if a.ID == uuid.Nil {
		a.ID = uuid.New()
	}
	if a.Status == "" {
		a.Status = "NEW"
	}
	if a.CreatedAt.IsZero() {
		a.CreatedAt = time.Now()
	}
	return nil
}
