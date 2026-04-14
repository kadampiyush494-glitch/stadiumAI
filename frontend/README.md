# OmniFlow Stadium Assistant

![Coverage](https://img.shields.io/badge/coverage-85%25-brightgreen)
![Build](https://img.shields.io/badge/build-passing-brightgreen)

OmniFlow is an AI-powered stadium navigation and crowd management system designed for maximum security, accessibility, and operational efficiency.

## 🧪 Complete Test Suite

The OmniFlow codebase is reinforced by a comprehensive test suite targeting **80%+ overall coverage**.

### 1. Unit Tests (Vitest)
- **`scoreOptimizer.test.js`**: 15 rigorous cases covering normal operations, edge cases (zeros, max values), stable tie-breaking, and NaN/invalid input handling (100% branch coverage).
- **`routingService.test.js`**: Verifies density-aware A* pathfinding, ensures avoidance of congested zones (>90%), and validates dynamic re-routing.
- **`queueService.test.js`**: Tests predictive queue growth algorithms and Firestore-synchronized real-time ranking.
- **`sanitizer.test.js`**: Validates protection against 20+ known XSS payloads and intense SQL injection patterns.
- **`rateLimit.test.js`**: Ensures token-bucket refill logic and strict enforcement of API thresholds.

### 2. Integration Tests
- **`firestoreIntegration.test.js`**: Validates real-time listener behavior and security rule enforcement via simulated failure checks.
- **`mapsIntegration.test.js`**: Mocks the Google Maps API loader to verify heatmap data binding and directions service integration.

### 3. E2E Tests (Playwright)
- **`userJourney.test.js`**: Simulates the complete user lifecycle: opening the map, querying the AI for facilities, receiving congestion alerts, and following an optimized exit route.
- **`accessibilityJourney.test.js`**: Validates full keyboard-only navigation (focus traps, skip-links) and accessibility announcements (`aria-live`).

## ⚙️ Testing Configuration
- **Coverage Thresholds**: 
  - Lines: 80%
  - Functions: 80%
  - Branches: 75%
  - Statements: 80%
- **Run Command**: `npm run test:coverage` (mapped to `vitest --coverage`)

## 🛠 Tech Stack
React 19, Vite, Tailwind CSS 4, Vitest, Playwright, Firebase v12, Google Maps Platform.
