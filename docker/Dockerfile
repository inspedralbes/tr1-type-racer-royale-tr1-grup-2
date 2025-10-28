# Stage 1: Build the frontend
FROM node:latest as builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Production environment
FROM node:latest
WORKDIR /app
COPY backend/package*.json ./
COPY backend/server.js ./
RUN npm install
COPY --from=builder /app/frontend/dist ./public
EXPOSE 3000
CMD ["node", "server.js"]
