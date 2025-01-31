package handlers

import (
	"context"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"linkcrush/internal/models"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

type UrlHandler struct {
	db    *gorm.DB
	redis *redis.Client
}

func NewUrlHandler(db *gorm.DB, redis *redis.Client) *UrlHandler {
	return &UrlHandler{db: db, redis: redis}
}

func (h *UrlHandler) SetShortUrl(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	defer ctx.Done()

	var reqBody models.ShortenRequest
	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		http.Error(w, "Error parsing the body", http.StatusInternalServerError)
		return
	}

	if !isValidURL(reqBody.Url) {
		http.Error(w, "Invalid URL", http.StatusBadRequest)
		return
	}

	shortCode := h.generateUniqueCode(ctx, reqBody.Url)
	urlData := models.Url{
		ID:          uuid.New().String(),
		Url:         reqBody.Url,
		ShortCode:   shortCode,
		AccessCount: 0,
	}

	err := h.db.Create(&urlData).Error
	if err != nil {
		http.Error(w, "Error while saving the data to database", http.StatusInternalServerError)
	}

	response := models.UrlResponse{
		ID:        urlData.ID,
		URL:       urlData.Url,
		ShortCode: urlData.ShortCode,
	}

	jsonStr, err := json.Marshal(urlData)
	if err != nil {
		http.Error(w, "Error marshaling data", http.StatusInternalServerError)
		return
	}
	if err := h.redis.Set(ctx, shortCode, jsonStr, time.Hour).Err(); err != nil {
		fmt.Printf("Redis cache set error: %v\n", err)
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Error converting the data to json", http.StatusInternalServerError)
	}
}

func (h *UrlHandler) GetShortUrl(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	defer ctx.Done()

	shortCode := r.PathValue("shortCode")
	var urlData models.Url
	var response models.UrlResponse

	cachedUrl, err := h.redis.Get(ctx, shortCode).Result()
	if err == nil {
		if err := json.Unmarshal([]byte(cachedUrl), &urlData); err != nil {
			http.Error(w, "Error unmarshalling JSON from Redis", http.StatusInternalServerError)
			return
		}

		response = models.UrlResponse{
			ID:        urlData.ID,
			URL:       urlData.Url,
			ShortCode: urlData.ShortCode,
		}

		go h.updateAccessCount(ctx, shortCode)

		w.Header().Set("Content-Type", "application/json")

		if err := json.NewEncoder(w).Encode(response); err != nil {
			http.Error(w, "Error converting the data to json", http.StatusInternalServerError)
		}
		return
	}

	if err := h.db.Where("short_code = ?", shortCode).First(&urlData).Error; err != nil {
		http.Error(w, "URL not found. Please check the short URL and try again.", http.StatusNotFound)
		return
	}

	response = models.UrlResponse{
		ID:        urlData.ID,
		URL:       urlData.Url,
		ShortCode: urlData.ShortCode,
	}

	jsonStr, _ := json.Marshal(urlData)
	if err := h.redis.Set(ctx, shortCode, jsonStr, time.Hour).Err(); err != nil {
		fmt.Printf("Redis cache set error: %v\n", err)
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Error converting the data to json", http.StatusInternalServerError)
	}
}

func (h *UrlHandler) GetShourtUrlStats(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	defer ctx.Done()

	shortCode := r.PathValue("shortCode")
	var urlData models.Url

	w.Header().Set("Content-Type", "application/json")

	cachedUrl, err := h.redis.Get(ctx, shortCode).Result()
	if err == nil {
		if err := json.Unmarshal([]byte(cachedUrl), &urlData); err != nil {
			http.Error(w, "Error unmarshalling JSON from Redis", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(urlData)
		return
	}

	if err := h.db.Where("short_code = ?", shortCode).First(&urlData).Error; err != nil {
		http.Error(w, "URL not found. Please check the short URL and try again.", http.StatusNotFound)
		return
	}

	jsonStr, _ := json.Marshal(urlData)
	if err := h.redis.Set(ctx, shortCode, jsonStr, time.Hour).Err(); err != nil {
		fmt.Printf("Redis cache set error: %v\n", err)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(urlData)
}

func (h *UrlHandler) updateAccessCount(ctx context.Context, shortCode string) {
	var urlData models.Url

	if err := h.db.Model(&urlData).Where("short_code = ?", shortCode).UpdateColumn("access_count", gorm.Expr("access_count + ?", 1)).Error; err != nil {
		fmt.Printf("Error updating access count in the database: %v\n", err)
	}

	if err := h.db.Where("short_code = ?", shortCode).First(&urlData).Error; err != nil {
		fmt.Printf("Error fetching updated record: %v\n", err)
		return
	}

	jsonStr, err := json.Marshal(urlData)
	if err != nil {
		fmt.Printf("Error marshaling updated data: %v\n", err)
		return
	}

	if err := h.redis.Set(ctx, shortCode, jsonStr, time.Hour).Err(); err != nil {
		fmt.Printf("Error updating Redis cache: %v\n", err)
		return
	}
}

func isValidURL(url string) bool {
	const urlPattern = `^(https?:\/\/)?([a-zA-Z0-9\-]+\.)+[a-zA-Z]{2,}(:[0-9]{1,5})?(\/[^\s]*)?$`
	re := regexp.MustCompile(urlPattern)
	return re.MatchString(url)
}

func (h *UrlHandler) generateUniqueCode(ctx context.Context, originalURL string) string {
	// Create a hash of the URL and timestamp for uniqueness
	data := fmt.Sprintf("%s%d", originalURL, time.Now().UnixNano())
	hash := sha256.Sum256([]byte(data))
	code := base64.URLEncoding.EncodeToString(hash[:])
	code = strings.ReplaceAll(code, "-", "")
	code = strings.ReplaceAll(code, "_", "")
	code = code[:8]

	// If code exists
	var urlData models.Url
	_, redisErr := h.redis.Get(ctx, code).Result()
	dbErr := h.db.Where("short_code = ?", code).First(&urlData).Error
	if redisErr == nil || dbErr == nil {
		return h.generateUniqueCode(ctx, originalURL)
	}

	return code
}
