# 🔗 LinkCrush: URL Shortener Web Application

## 📝 Project Overview

LinkCrush is a modern, full-stack URL shortening web application that allows users to convert long, complex URLs into short, shareable links. Built with cutting-edge technologies, LinkCrush provides a seamless and efficient link management experience.

## ✨ Features

- 🔗 **URL Shortening**: Convert long URLs into concise, easy-to-share links
- 📊 **Link Analytics**: Track access count and view link statistics
- 🚀 **Fast Performance**: Utilizes Redis caching for quick URL retrieval
- 💾 **Persistent Storage**: Stores link data in a robust database
- 🛡️ **URL Validation**: Ensures only valid URLs are shortened

## 🛠 Tech Stack

### Backend

- 🟦 **Language**: Go (Golang)
- 💾 **Database**: GORM with PostgreSQL
- 🔴 **Caching**: Redis
- 🌐 **Web Framework**: Standard Go `net/http`

### Frontend

- ⚛️ **React**: JavaScript library for building user interfaces
- 🎨 **Styling**: Tailwind CSS
- 🚦 **Routing**: React Router

## 🔧 Configuration

- **Database**: Configure connection in `internal/config/database.go`
- **Redis**: Configure in `internal/config/redis.go`
- **Environment**: Use `.env` file for sensitive configurations

## 📦 API Endpoints

- `POST /shorten`: Create short URL
- `GET /shorten/{shortCode}`: Retrieve original URL
- `GET /shorten/{shortCode}/stats`: Get link statistics
