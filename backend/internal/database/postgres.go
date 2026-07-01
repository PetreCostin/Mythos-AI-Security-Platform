package database

import (
	"errors"
	"time"

	"github.com/mythos-ai/security-platform/backend/internal/models"
	"go.uber.org/zap"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	gormlogger "gorm.io/gorm/logger"
)

func NewPostgres(dsn string, logger *zap.Logger) (*gorm.DB, error) {
	if dsn == "" {
		return nil, errors.New("DATABASE_URL is required")
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: gormlogger.Default.LogMode(gormlogger.Warn),
	})
	if err != nil {
		return nil, err
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, err
	}
	sqlDB.SetMaxIdleConns(5)
	sqlDB.SetMaxOpenConns(20)
	sqlDB.SetConnMaxLifetime(30 * time.Minute)

	if err := AutoMigrate(db); err != nil {
		return nil, err
	}

	if logger != nil {
		logger.Info("postgres connection established")
	}

	return db, nil
}

func AutoMigrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&models.User{},
		&models.Alert{},
		&models.Incident{},
		&models.CVE{},
		&models.IOC{},
		&models.ThreatIntel{},
		&models.Vulnerability{},
	)
}
