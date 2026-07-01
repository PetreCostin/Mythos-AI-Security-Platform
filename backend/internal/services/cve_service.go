package services

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/mythos-ai/security-platform/backend/internal/config"
	"github.com/mythos-ai/security-platform/backend/internal/models"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type CVEService struct {
	db     *gorm.DB
	cfg    *config.Config
	logger *zap.Logger
	client *http.Client
}

func NewCVEService(db *gorm.DB, cfg *config.Config, logger *zap.Logger) *CVEService {
	return &CVEService{
		db:     db,
		cfg:    cfg,
		logger: logger,
		client: &http.Client{Timeout: 30 * time.Second},
	}
}

func (s *CVEService) SyncFromNVD(ctx context.Context) error {
	endpoint := "https://services.nvd.nist.gov/rest/json/cves/2.0?resultsPerPage=20"
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint, nil)
	if err != nil {
		return err
	}
	if s.cfg.NVDAPIKey != "" {
		req.Header.Set("apiKey", s.cfg.NVDAPIKey)
	}

	resp, err := s.client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		return fmt.Errorf("nvd sync failed with status %d", resp.StatusCode)
	}

	var payload nvdResponse
	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		return err
	}

	for _, item := range payload.Vulnerabilities {
		record := item.CVE.toModel()
		if err := s.db.Where("cve_id = ?", record.CVEID).Assign(record).FirstOrCreate(&record).Error; err != nil {
			return err
		}
	}

	return nil
}

func (s *CVEService) Search(query, severity string, page, pageSize int) ([]models.CVE, int64, error) {
	var total int64
	var results []models.CVE

	dbQuery := s.db.Model(&models.CVE{})
	if query != "" {
		like := "%" + strings.ToLower(query) + "%"
		dbQuery = dbQuery.Where("LOWER(cve_id) LIKE ? OR LOWER(description) LIKE ?", like, like)
	}
	if severity != "" {
		dbQuery = dbQuery.Where("severity = ?", severity)
	}

	if err := dbQuery.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if err := dbQuery.Order("published_date desc").Limit(pageSize).Offset((page - 1) * pageSize).Find(&results).Error; err != nil {
		return nil, 0, err
	}
	return results, total, nil
}

type nvdResponse struct {
	Vulnerabilities []struct {
		CVE nvdCVE `json:"cve"`
	} `json:"vulnerabilities"`
}

type nvdCVE struct {
	ID           string `json:"id"`
	Published    string `json:"published"`
	LastModified string `json:"lastModified"`
	VulnStatus   string `json:"vulnStatus"`
	Descriptions []struct {
		Lang  string `json:"lang"`
		Value string `json:"value"`
	} `json:"descriptions"`
	Metrics struct {
		CVSSMetricV31 []struct {
			CVSSData struct {
				BaseScore    float64 `json:"baseScore"`
				VectorString string  `json:"vectorString"`
				BaseSeverity string  `json:"baseSeverity"`
			} `json:"cvssData"`
		} `json:"cvssMetricV31"`
		CVSSMetricV30 []struct {
			CVSSData struct {
				BaseScore    float64 `json:"baseScore"`
				VectorString string  `json:"vectorString"`
				BaseSeverity string  `json:"baseSeverity"`
			} `json:"cvssData"`
		} `json:"cvssMetricV30"`
		CVSSMetricV2 []struct {
			CVSSData struct {
				BaseScore    float64 `json:"baseScore"`
				VectorString string  `json:"vectorString"`
			} `json:"cvssData"`
			BaseSeverity string `json:"baseSeverity"`
		} `json:"cvssMetricV2"`
	} `json:"metrics"`
	Configurations []struct {
		Nodes []struct {
			CPEMatch []struct {
				Criteria string `json:"criteria"`
			} `json:"cpeMatch"`
		} `json:"nodes"`
	} `json:"configurations"`
	References []struct {
		URL string `json:"url"`
	} `json:"references"`
}

func (c nvdCVE) toModel() models.CVE {
	published, _ := time.Parse(time.RFC3339, c.Published)
	modified, _ := time.Parse(time.RFC3339, c.LastModified)
	description := c.ID
	for _, item := range c.Descriptions {
		if item.Lang == "en" {
			description = item.Value
			break
		}
	}

	severity := "UNKNOWN"
	score := 0.0
	vector := ""
	switch {
	case len(c.Metrics.CVSSMetricV31) > 0:
		metric := c.Metrics.CVSSMetricV31[0].CVSSData
		severity = metric.BaseSeverity
		score = metric.BaseScore
		vector = metric.VectorString
	case len(c.Metrics.CVSSMetricV30) > 0:
		metric := c.Metrics.CVSSMetricV30[0].CVSSData
		severity = metric.BaseSeverity
		score = metric.BaseScore
		vector = metric.VectorString
	case len(c.Metrics.CVSSMetricV2) > 0:
		metric := c.Metrics.CVSSMetricV2[0]
		severity = metric.BaseSeverity
		score = metric.CVSSData.BaseScore
		vector = metric.CVSSData.VectorString
	}

	references := make([]string, 0, len(c.References))
	for _, ref := range c.References {
		references = append(references, ref.URL)
	}

	products := []string{}
	for _, cfg := range c.Configurations {
		for _, node := range cfg.Nodes {
			for _, match := range node.CPEMatch {
				products = append(products, normalizeCPE(match.Criteria))
			}
		}
	}

	return models.CVE{
		CVEID:            c.ID,
		Description:      description,
		Severity:         severity,
		CVSSScore:        score,
		CVSSVector:       vector,
		AffectedProducts: models.NewJSONB(products),
		PublishedDate:    published,
		ModifiedDate:     modified,
		References:       models.NewJSONB(references),
		ExploitAvailable: score >= 8.5,
	}
}

func normalizeCPE(criteria string) string {
	parsed, err := url.PathUnescape(criteria)
	if err != nil {
		return criteria
	}
	return strings.TrimPrefix(parsed, "cpe:2.3:")
}
