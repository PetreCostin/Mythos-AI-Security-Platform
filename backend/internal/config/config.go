package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DatabaseURL  string
	RedisURL     string
	JWTSecret    string
	AIServiceURL string
	Port         string
	Env          string
	NVDAPIKey    string
}

func Load() *Config {
	_ = godotenv.Load()

	return &Config{
		DatabaseURL:  getenv("DATABASE_URL", "******localhost:5432/mythos_security?sslmode=disable"),
		RedisURL:     getenv("REDIS_URL", "redis://localhost:6379"),
		JWTSecret:    getenv("JWT_SECRET", "development-secret-change-me"),
		AIServiceURL: getenv("AI_SERVICE_URL", "http://ai-service:8001"),
		Port:         getenv("PORT", "8080"),
		Env:          getenv("ENV", "development"),
		NVDAPIKey:    os.Getenv("NVD_API_KEY"),
	}
}

func getenv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
