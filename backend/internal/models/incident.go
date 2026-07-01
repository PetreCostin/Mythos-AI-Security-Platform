package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type TimelineEntry struct {
	Timestamp time.Time `json:"timestamp"`
	Author    string    `json:"author"`
	Message   string    `json:"message"`
	Notes     string    `json:"notes,omitempty"`
}

type Incident struct {
	ID           uuid.UUID  `gorm:"type:uuid;primaryKey" json:"id"`
	Title        string     `gorm:"not null" json:"title"`
	Description  string     `gorm:"type:text" json:"description"`
	Severity     string     `gorm:"size:20;index;not null" json:"severity"`
	Status       string     `gorm:"size:30;index;not null;default:NEW" json:"status"`
	CreatedAt    time.Time  `json:"createdAt"`
	UpdatedAt    time.Time  `json:"updatedAt"`
	ResolvedAt   *time.Time `json:"resolvedAt,omitempty"`
	AssignedTo   *uuid.UUID `gorm:"type:uuid;index" json:"assignedTo,omitempty"`
	AssignedUser *User      `gorm:"foreignKey:AssignedTo" json:"assignedUser,omitempty"`
	Timeline     JSONB      `gorm:"type:jsonb" json:"timeline"`
	AIAnalysis   string     `gorm:"type:text" json:"aiAnalysis"`
	Playbook     string     `gorm:"type:text" json:"playbook"`
	Alerts       []Alert    `gorm:"many2many:incident_alerts;" json:"alerts,omitempty"`
}

func (i *Incident) BeforeCreate(tx *gorm.DB) error {
	if i.ID == uuid.Nil {
		i.ID = uuid.New()
	}
	if i.Status == "" {
		i.Status = "NEW"
	}
	if i.CreatedAt.IsZero() {
		i.CreatedAt = time.Now()
	}
	return nil
}
