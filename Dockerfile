# --- Etapa base con Node ---
FROM node:20 AS base
WORKDIR /app

# --- Backend Dev ---
FROM base AS backend-dev
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ .
# Nodemon para hot-reload
RUN npm install -g nodemon
EXPOSE 3000
CMD ["npx", "nodemon", "server.js"]

# --- Frontend Dev ---
FROM base AS frontend-dev
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
EXPOSE 4000
CMD ["npm", "run", "dev"]
