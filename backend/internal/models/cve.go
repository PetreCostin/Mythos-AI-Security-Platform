package models

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type JSONB []byte

func NewJSONB(value any) JSONB {
	payload, _ := json.Marshal(value)
	return JSONB(payload)
}

func (j JSONB) MarshalJSON() ([]byte, error) {
	if len(j) == 0 {
		return []byte("null"), nil
	}
	return j, nil
}

func (j *JSONB) UnmarshalJSON(data []byte) error {
	if data == nil {
		*j = nil
		return nil
	}
	*j = append((*j)[:0], data...)
	return nil
}

func (j JSONB) Value() (driver.Value, error) {
	if len(j) == 0 {
		return []byte("null"), nil
	}
	return []byte(j), nil
}

func (j *JSONB) Scan(value any) error {
	switch typed := value.(type) {
	case nil:
		*j = nil
	case []byte:
		*j = append((*j)[:0], typed...)
	case string:
		*j = append((*j)[:0], typed...)
	default:
		return fmt.Errorf("unsupported JSONB type: %T", value)
	}
	return nil
}

type CVE struct {
	ID               uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	CVEID            string    `gorm:"column:cve_id;uniqueIndex;not null" json:"cveId"`
	Description      string    `gorm:"type:text" json:"description"`
	Severity         string    `gorm:"size:20;index" json:"severity"`
	CVSSScore        float64   `json:"cvssScore"`
	CVSSVector       string    `json:"cvssVector"`
	AffectedProducts JSONB     `gorm:"type:jsonb" json:"affectedProducts"`
	PublishedDate    time.Time `json:"publishedDate"`
	ModifiedDate     time.Time `json:"modifiedDate"`
	References       JSONB     `gorm:"column:reference_links;type:jsonb" json:"references"`
	ExploitAvailable bool      `json:"exploitAvailable"`
}

func (c *CVE) BeforeCreate(tx *gorm.DB) error {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	return nil
}
