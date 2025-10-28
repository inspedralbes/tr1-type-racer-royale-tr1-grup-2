# Usa una imagen oficial de Node.js como base
FROM node:latest

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos necesarios
COPY backend/package*.json ./
COPY backend/server.js ./

# Instala las dependencias
RUN npm install

# Expone el puerto en el que corre la app
EXPOSE 3000

# Comando para ejecutar la app
CMD ["node", "server.js"]
