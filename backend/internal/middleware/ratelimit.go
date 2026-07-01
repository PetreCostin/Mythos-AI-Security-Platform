package middleware

import (
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type rateEntry struct {
	mu    sync.Mutex
	count int
	reset time.Time
}

func NewRateLimiter(maxRequests int, window time.Duration) gin.HandlerFunc {
	var clients sync.Map

	return func(c *gin.Context) {
		key := c.ClientIP()
		now := time.Now()
		value, _ := clients.LoadOrStore(key, &rateEntry{reset: now.Add(window)})
		entry := value.(*rateEntry)

		entry.mu.Lock()
		defer entry.mu.Unlock()

		if now.After(entry.reset) {
			entry.count = 0
			entry.reset = now.Add(window)
		}

		entry.count++
		c.Header("X-RateLimit-Limit", intToString(maxRequests))
		c.Header("X-RateLimit-Remaining", intToString(maxRequests-entry.count))

		if entry.count > maxRequests {
			retryAfter := int(entry.reset.Sub(now).Seconds())
			if retryAfter < 1 {
				retryAfter = 1
			}
			c.Header("Retry-After", intToString(retryAfter))
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{"error": "rate limit exceeded"})
			return
		}

		c.Next()
	}
}

func intToString(v int) string {
	return fmt.Sprintf("%d", v)
}
