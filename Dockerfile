# --- Etapa para construir el Backend ---
FROM node:latest as backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ .

# --- Etapa para construir el Frontend ---
FROM node:latest as frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# --- Etapa final para la imagen del Backend ---
FROM node:latest as backend-final
WORKDIR /app
COPY --from=backend-builder /app/backend .
EXPOSE 3000
CMD ["node", "server.js"]

# --- Etapa final para la imagen del Frontend ---
FROM nginx:alpine as frontend-final
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
