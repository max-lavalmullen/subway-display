# Build stage for React frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Production stage
FROM python:3.11-slim
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Copy backend code
COPY app.py mta_client.py config.py stations.py ./
COPY station_config.json ./

# Copy built frontend
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# Expose port
EXPOSE 5001

# Run with gunicorn for production
CMD ["gunicorn", "--bind", "0.0.0.0:5001", "--workers", "2", "app:app"]
