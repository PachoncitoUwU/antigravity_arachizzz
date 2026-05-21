FROM node:20-alpine

WORKDIR /app

# Copiar solo package*.json primero para aprovechar cache de npm
COPY package*.json ./

# Instalar dependencias (incluye devDependencies para desarrollo)
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer el puerto que usa Vite
EXPOSE 5173

# Comando para iniciar el servidor de desarrollo con --host para acceso externo
CMD ["npm", "run", "dev", "--", "--host"]