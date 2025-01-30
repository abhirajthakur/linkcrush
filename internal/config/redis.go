package config

import (
	"time"

	"github.com/redis/go-redis/v9"
)

func NewRedisClient() *redis.Client {
	/*
	 * Use the below commented code when using localhost using docker
	 *
	 */

	return redis.NewClient(&redis.Options{
		Addr:         "localhost:6379",
		Password:     "",
		DB:           0,
		DialTimeout:  10 * time.Second,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 30 * time.Second,
		PoolSize:     10,
		PoolTimeout:  30 * time.Second,
	})

	// url := os.Getenv("REDIS_URL")
	// opts, err := redis.ParseURL(url)
	// if err != nil {
	// 	log.Printf("Error parsing Redis URL: %v", err)
	// 	return nil
	// }
	// return redis.NewClient(opts)
}
