FROM node:20

WORKDIR /app

# 1. Copiar solo package*.json primero (para cache de npm)
COPY package*.json ./

# 2. Copiar la carpeta prisma ANTES de npm install (para que postinstall funcione)
COPY prisma/ ./prisma/

# 3. Instalar dependencias (ahora prisma generate encontrará el schema)
RUN npm install --omit=dev

# 4. Copiar el resto del código de la aplicación
COPY . .

# 5. Exponer puerto
EXPOSE 3000

# 6. Comando de inicio
CMD ["node", "server.js"]