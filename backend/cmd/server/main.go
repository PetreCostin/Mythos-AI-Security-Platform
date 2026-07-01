package main

import (
	"fmt"
	"math/rand"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/mythos-ai/security-platform/backend/internal/config"
	"github.com/mythos-ai/security-platform/backend/internal/database"
	"github.com/mythos-ai/security-platform/backend/internal/handlers"
	"github.com/mythos-ai/security-platform/backend/internal/models"
	"github.com/mythos-ai/security-platform/backend/internal/routes"
	"go.uber.org/zap"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func main() {
	cfg := config.Load()
	logger := newLogger(cfg.Env)
	defer func() { _ = logger.Sync() }()

	db, err := database.NewPostgres(cfg.DatabaseURL, logger)
	if err != nil {
		logger.Fatal("failed to connect to postgres", zap.Error(err))
	}

	redisClient, err := database.NewRedis(cfg.RedisURL)
	if err != nil {
		logger.Warn("failed to connect to redis", zap.Error(err))
	}

	if strings.EqualFold(cfg.Env, "development") {
		if err := seedDevelopmentData(db, logger); err != nil {
			logger.Warn("failed to seed development data", zap.Error(err))
		}
	}

	hub := handlers.NewHub(logger)
	go hub.Run()

	router := gin.New()
	routes.Register(router, routes.Dependencies{
		DB:     db,
		Redis:  redisClient,
		Config: cfg,
		Logger: logger,
		Hub:    hub,
	})

	addr := cfg.Port
	if !strings.HasPrefix(addr, ":") {
		addr = ":" + addr
	}

	logger.Info("starting Mythos AI Security Platform backend", zap.String("addr", addr), zap.String("env", cfg.Env))
	if err := router.Run(addr); err != nil {
		logger.Fatal("server stopped", zap.Error(err))
	}
}

func newLogger(env string) *zap.Logger {
	if strings.EqualFold(env, "development") {
		logger, err := zap.NewDevelopment()
		if err == nil {
			return logger
		}
	}
	logger, err := zap.NewProduction()
	if err != nil {
		panic(err)
	}
	return logger
}

func seedDevelopmentData(db *gorm.DB, logger *zap.Logger) error {
	admin := models.User{}
	if err := db.Where("email = ?", "admin@mythos.ai").First(&admin).Error; err != nil {
		if err != gorm.ErrRecordNotFound {
			return err
		}
		passwordHash, hashErr := bcrypt.GenerateFromPassword([]byte("Admin@123!"), bcrypt.DefaultCost)
		if hashErr != nil {
			return hashErr
		}
		admin = models.User{
			Email:        "admin@mythos.ai",
			PasswordHash: string(passwordHash),
			Role:         "admin",
		}
		if err := db.Create(&admin).Error; err != nil {
			return err
		}
		logger.Info("seeded development admin user", zap.String("email", admin.Email))
	}

	rng := rand.New(rand.NewSource(42))

	if err := seedThreats(db, rng); err != nil {
		return err
	}
	if err := seedAlerts(db, rng, admin.ID); err != nil {
		return err
	}
	if err := seedIncidents(db, rng, admin.ID); err != nil {
		return err
	}
	if err := seedCVEs(db, rng); err != nil {
		return err
	}
	if err := seedIOCs(db, rng); err != nil {
		return err
	}

	return nil
}

func seedThreats(db *gorm.DB, rng *rand.Rand) error {
	var count int64
	if err := db.Model(&models.ThreatIntel{}).Count(&count).Error; err != nil {
		return err
	}
	if count >= 8 {
		return nil
	}

	actors := []string{"APT29", "Lazarus Group", "FIN7", "APT41", "Volt Typhoon", "Sandworm", "Scattered Spider", "Wizard Spider"}
	campaigns := []string{"Supply Chain Pivot", "Cloud Credential Harvest", "Living off the Land Burst", "Ransomware Staging", "Data Exfiltration Run", "Privilege Escalation Sprint", "Lateral Movement Wave", "Persistence Sweep"}
	techniques := [][]string{{"T1078", "T1566.001"}, {"T1027", "T1105"}, {"T1059.001", "T1486"}, {"T1190", "T1133"}}
	severities := []string{"CRITICAL", "HIGH", "MEDIUM"}

	for i := int(count); i < 8; i++ {
		techs := techniques[i%len(techniques)]
		threat := models.ThreatIntel{
			Name:                  fmt.Sprintf("%s Intelligence Brief", actors[i%len(actors)]),
			ThreatActor:           actors[i%len(actors)],
			Campaign:              campaigns[i%len(campaigns)],
			MitreAttackTechniques: models.NewJSONB(techs),
			TTPs:                  models.NewJSONB([]string{"credential dumping", "defense evasion", "command and control"}),
			Description:           fmt.Sprintf("Ongoing activity tied to %s targeting hybrid infrastructure.", actors[i%len(actors)]),
			Severity:              severities[i%len(severities)],
		}
		if err := db.Create(&threat).Error; err != nil {
			return err
		}
	}
	return nil
}

func seedAlerts(db *gorm.DB, rng *rand.Rand, adminID uuid.UUID) error {
	var count int64
	if err := db.Model(&models.Alert{}).Count(&count).Error; err != nil {
		return err
	}
	if count >= 50 {
		return nil
	}

	severities := []string{"CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"}
	statuses := []string{"NEW", "ACKNOWLEDGED", "RESOLVED", "FALSE_POSITIVE"}
	titles := []string{
		"Suspicious PowerShell Execution",
		"Privilege Escalation Attempt",
		"Unusual VPN Login",
		"Lateral Movement Detected",
		"Outbound Data Exfiltration",
		"Malicious DNS Beaconing",
		"Endpoint Malware Detection",
		"Brute Force Authentication Pattern",
		"Cloud IAM Policy Drift",
		"Potential Web Shell Activity",
	}
	techniques := []string{"T1059.001", "T1078", "T1021.001", "T1486", "T1041", "T1105", "T1566.001", "T1190", "T1548", "T1133"}
	sources := []string{"CrowdStrike", "Microsoft Sentinel", "Wazuh", "Okta", "AWS GuardDuty", "Cloudflare", "Splunk", "Zeek"}
	protocols := []string{"TCP", "UDP", "HTTPS", "DNS", "ICMP"}

	for i := int(count); i < 50; i++ {
		createdAt := time.Now().Add(-time.Duration(rng.Intn(240)) * time.Hour)
		sourceIP := fmt.Sprintf("10.%d.%d.%d", rng.Intn(255), rng.Intn(255), rng.Intn(255))
		destIP := fmt.Sprintf("172.16.%d.%d", rng.Intn(255), rng.Intn(255))
		alert := models.Alert{
			Title:                titles[i%len(titles)],
			Description:          fmt.Sprintf("Correlation rule triggered for %s against production asset cluster-%02d.", titles[i%len(titles)], i%12+1),
			Severity:             severities[i%len(severities)],
			Status:               statuses[i%len(statuses)],
			Source:               sources[i%len(sources)],
			SourceIP:             sourceIP,
			DestIP:               destIP,
			Protocol:             protocols[i%len(protocols)],
			Port:                 20 + (i % 15 * 11),
			RawLog:               fmt.Sprintf(`{"event":"%s","host":"prod-node-%02d","source_ip":"%s","dest_ip":"%s"}`, titles[i%len(titles)], i%20+1, sourceIP, destIP),
			MitreAttackTechnique: techniques[i%len(techniques)],
			CreatedAt:            createdAt,
			UpdatedAt:            createdAt.Add(time.Duration(rng.Intn(8)) * time.Hour),
			AssignedTo:           &adminID,
		}
		if err := db.Create(&alert).Error; err != nil {
			return err
		}
	}
	return nil
}

func seedIncidents(db *gorm.DB, rng *rand.Rand, adminID uuid.UUID) error {
	var count int64
	if err := db.Model(&models.Incident{}).Count(&count).Error; err != nil {
		return err
	}
	if count >= 10 {
		return nil
	}

	var alerts []models.Alert
	if err := db.Order("created_at desc").Limit(20).Find(&alerts).Error; err != nil {
		return err
	}

	severities := []string{"CRITICAL", "HIGH", "MEDIUM"}
	statuses := []string{"NEW", "INVESTIGATING", "CONTAINED", "RESOLVED"}
	names := []string{
		"Credential Theft Investigation",
		"Ransomware Containment",
		"Suspicious Lateral Movement",
		"Cloud Access Key Exposure",
		"Privileged Account Misuse",
		"Malware Beaconing Campaign",
		"Insider Data Exfiltration",
		"Phishing Impact Assessment",
		"Zero-Day Triage",
		"Command and Control Interruption",
	}

	for i := int(count); i < 10; i++ {
		timeline := []models.TimelineEntry{
			{Timestamp: time.Now().Add(-time.Duration(12+i) * time.Hour), Author: "mythos-ai", Message: "Incident opened from correlated alerts."},
			{Timestamp: time.Now().Add(-time.Duration(8+i) * time.Hour), Author: "analyst", Message: "Containment actions initiated on impacted asset."},
		}
		incident := models.Incident{
			Title:       names[i%len(names)],
			Description: fmt.Sprintf("Investigation launched for %s affecting workload group %d.", names[i%len(names)], i%5+1),
			Severity:    severities[i%len(severities)],
			Status:      statuses[i%len(statuses)],
			AssignedTo:  &adminID,
			Timeline:    models.NewJSONB(timeline),
			AIAnalysis:  "AI triage indicates likely credential abuse followed by privilege escalation.",
			Playbook: `1. Isolate host
2. Reset impacted credentials
3. Hunt for persistence
4. Validate log coverage`,
		}
		if incident.Status == "RESOLVED" {
			resolvedAt := time.Now().Add(-time.Duration(i) * time.Hour)
			incident.ResolvedAt = &resolvedAt
		}
		if err := db.Create(&incident).Error; err != nil {
			return err
		}
		if len(alerts) > 0 {
			start := (i * 2) % len(alerts)
			end := start + 2
			if end > len(alerts) {
				end = len(alerts)
			}
			if start < end {
				if err := db.Model(&incident).Association("Alerts").Append(alerts[start:end]); err != nil {
					return err
				}
			}
		}
	}
	return nil
}

func seedCVEs(db *gorm.DB, rng *rand.Rand) error {
	var count int64
	if err := db.Model(&models.CVE{}).Count(&count).Error; err != nil {
		return err
	}
	if count >= 20 {
		return nil
	}

	severities := []string{"CRITICAL", "HIGH", "MEDIUM"}
	products := [][]string{{"Ubuntu 22.04", "OpenSSL 3.x"}, {"Kubernetes 1.29", "Ingress Controller"}, {"PostgreSQL 15", "TimescaleDB"}, {"Windows Server 2022", "IIS"}}

	for i := int(count); i < 20; i++ {
		published := time.Now().AddDate(0, 0, -i)
		cve := models.CVE{
			CVEID:            fmt.Sprintf("CVE-2024-%04d", 1200+i),
			Description:      fmt.Sprintf("Synthetic seeded CVE entry %d for development and dashboard validation.", i+1),
			Severity:         severities[i%len(severities)],
			CVSSScore:        5.5 + float64(i%5),
			CVSSVector:       "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
			AffectedProducts: models.NewJSONB(products[i%len(products)]),
			PublishedDate:    published,
			ModifiedDate:     published.Add(6 * time.Hour),
			References:       models.NewJSONB([]string{fmt.Sprintf("https://nvd.nist.gov/vuln/detail/CVE-2024-%04d", 1200+i)}),
			ExploitAvailable: i%3 == 0,
		}
		if err := db.Where("cve_id = ?", cve.CVEID).FirstOrCreate(&cve).Error; err != nil {
			return err
		}
	}
	return nil
}

func seedIOCs(db *gorm.DB, rng *rand.Rand) error {
	var count int64
	if err := db.Model(&models.IOC{}).Count(&count).Error; err != nil {
		return err
	}
	if count >= 30 {
		return nil
	}

	types := []string{"ip", "domain", "hash", "url", "email"}
	threats := []string{"phishing", "ransomware", "botnet", "credential-theft", "c2"}
	domains := []string{"login-check-secure.net", "cdn-sso-edge.io", "storage-sync-alerts.com", "vpn-access-review.org"}

	for i := int(count); i < 30; i++ {
		iocType := types[i%len(types)]
		value := fmt.Sprintf("ioc-%d", i)
		switch iocType {
		case "ip":
			value = fmt.Sprintf("198.51.100.%d", i+10)
		case "domain":
			value = domains[i%len(domains)]
		case "hash":
			value = fmt.Sprintf("%x", uuid.New()) + fmt.Sprintf("%x", uuid.New())
		case "url":
			value = fmt.Sprintf("https://%s/payload/%d", domains[i%len(domains)], i+1)
		case "email":
			value = fmt.Sprintf("operator%d@%s", i+1, domains[i%len(domains)])
		}
		firstSeen := time.Now().Add(-time.Duration(72+i) * time.Hour)
		lastSeen := firstSeen.Add(time.Duration(12+i) * time.Hour)
		ioc := models.IOC{
			Type:       iocType,
			Value:      value,
			ThreatType: threats[i%len(threats)],
			Confidence: 55 + (i*3)%45,
			Source:     "mythos-seed",
			Tags:       models.NewJSONB([]string{"seeded", "triage", threats[i%len(threats)]}),
			FirstSeen:  &firstSeen,
			LastSeen:   &lastSeen,
			Active:     true,
		}
		if err := db.Create(&ioc).Error; err != nil {
			return err
		}
	}
	return nil
}
