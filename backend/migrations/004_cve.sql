CREATE TABLE IF NOT EXISTS cves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cve_id TEXT NOT NULL UNIQUE,
    description TEXT,
    severity TEXT,
    cvss_score DOUBLE PRECISION,
    cvss_vector TEXT,
    affected_products JSONB NOT NULL DEFAULT '[]'::jsonb,
    published_date TIMESTAMPTZ,
    modified_date TIMESTAMPTZ,
    reference_links JSONB NOT NULL DEFAULT '[]'::jsonb,
    exploit_available BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_cves_severity ON cves(severity);
CREATE INDEX IF NOT EXISTS idx_cves_published_date ON cves(published_date DESC);
