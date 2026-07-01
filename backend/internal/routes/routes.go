package routes

import (
	"time"

	redis "github.com/redis/go-redis/v9"

	"github.com/gin-contrib/requestid"
	"github.com/gin-gonic/gin"
	"github.com/mythos-ai/security-platform/backend/internal/config"
	"github.com/mythos-ai/security-platform/backend/internal/handlers"
	"github.com/mythos-ai/security-platform/backend/internal/middleware"
	"github.com/mythos-ai/security-platform/backend/internal/services"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type Dependencies struct {
	DB     *gorm.DB
	Redis  *redis.Client
	Config *config.Config
	Logger *zap.Logger
	Hub    *handlers.Hub
}

func Register(router *gin.Engine, deps Dependencies) {
	router.Use(gin.Recovery())
	router.Use(requestid.New())
	router.Use(middleware.CORSMiddleware())
	router.Use(middleware.LoggerMiddleware(deps.Logger))
	router.Use(middleware.NewRateLimiter(300, time.Minute))

	router.GET("/healthz", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	alertService := services.NewAlertService(deps.DB, deps.Logger)
	cveService := services.NewCVEService(deps.DB, deps.Config, deps.Logger)
	threatService := services.NewThreatService(deps.DB, deps.Logger)

	authHandler := handlers.NewAuthHandler(deps.DB, deps.Config, deps.Logger)
	alertHandler := handlers.NewAlertHandler(deps.DB, alertService)
	incidentHandler := handlers.NewIncidentHandler(deps.DB, deps.Config, deps.Logger)
	cveHandler := handlers.NewCVEHandler(deps.DB, cveService, deps.Logger)
	iocHandler := handlers.NewIOCHandler(deps.DB)
	threatHandler := handlers.NewThreatHandler(deps.DB, threatService)
	vulnHandler := handlers.NewVulnerabilityHandler(deps.DB, deps.Logger)
	malwareHandler := handlers.NewMalwareHandler(deps.Config)
	dashboardHandler := handlers.NewDashboardHandler(deps.DB)
	wsHandler := handlers.NewWebsocketHandler(deps.Hub)
	siemHandler := handlers.NewSIEMHandler(deps.DB, alertService, deps.Hub)

	api := router.Group("/api")
	auth := api.Group("/auth")
	{
		auth.POST("/register", authHandler.Register)
		auth.POST("/login", authHandler.Login)
		auth.POST("/refresh", authHandler.Refresh)
	}

	protected := api.Group("")
	protected.Use(middleware.AuthMiddleware(deps.Config, deps.DB))
	{
		protected.GET("/auth/me", authHandler.Me)
		protected.GET("/alerts", alertHandler.List)
		protected.GET("/alerts/stats", alertHandler.Stats)
		protected.GET("/alerts/:id", alertHandler.Detail)
		protected.PUT("/alerts/:id/status", alertHandler.UpdateStatus)

		protected.GET("/incidents", incidentHandler.List)
		protected.POST("/incidents", incidentHandler.Create)
		protected.GET("/incidents/:id", incidentHandler.Detail)
		protected.PUT("/incidents/:id", incidentHandler.Update)
		protected.POST("/incidents/:id/timeline", incidentHandler.AddTimelineEntry)
		protected.GET("/incidents/:id/playbook", incidentHandler.GetPlaybook)

		protected.GET("/cve/search", cveHandler.Search)
		protected.GET("/cve/recent", cveHandler.Recent)
		protected.GET("/cve/:id", cveHandler.Detail)
		protected.POST("/cve/sync", cveHandler.Sync)

		protected.GET("/ioc/search", iocHandler.Search)
		protected.POST("/ioc", iocHandler.Create)
		protected.GET("/ioc/:id", iocHandler.Detail)
		protected.PUT("/ioc/:id", iocHandler.Update)
		protected.DELETE("/ioc/:id", iocHandler.Deactivate)

		protected.GET("/threats", threatHandler.List)
		protected.GET("/threats/search", threatHandler.Search)
		protected.GET("/threats/:id", threatHandler.Detail)

		protected.POST("/vuln/scan", vulnHandler.TriggerScan)
		protected.GET("/vuln/scan/:jobId", vulnHandler.GetScanStatus)
		protected.GET("/vuln", vulnHandler.List)
		protected.PUT("/vuln/:id/status", vulnHandler.UpdateStatus)

		protected.POST("/malware/analyze", malwareHandler.Analyze)
		protected.GET("/malware/reports", malwareHandler.ListReports)
		protected.GET("/malware/reports/:id", malwareHandler.GetReport)

		protected.GET("/dashboard/stats", dashboardHandler.Stats)
		protected.GET("/ws", wsHandler.Serve)

		protected.POST("/siem/ingest", siemHandler.Ingest)
		protected.GET("/siem/sources", siemHandler.Sources)
	}
}
