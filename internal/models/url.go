package models

type Url struct {
	ID          string `json:"id" gorm:"primaryKey"`
	Url         string `json:"url"`
	ShortCode   string `json:"short_code" gorm:"unique"`
	AccessCount uint   `json:"access_count" gorm:"default:0"`
}

type ShortenRequest struct {
	Url string `json:"url"`
}

type UrlResponse struct {
	ID        string `json:"id"`
	URL       string `json:"url"`
	ShortCode string `json:"short_code"`
}

type UrlStatsResponse struct {
	ID          string `json:"id"`
	URL         string `json:"url"`
	ShortCode   string `json:"short_code"`
	AccessCount uint   `json:"access_count"`
}
