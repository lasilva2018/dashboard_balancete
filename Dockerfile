# Dockerfile para Frontend (React)
FROM node:20-alpine

# Instalar pnpm
RUN npm install -g pnpm

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json primeiro (para cache do Docker)
COPY package.json pnpm-lock.yaml ./

# Instalar dependências
RUN pnpm install

# Copiar código da aplicação
COPY . .

# Expor porta
EXPOSE 5173

# Comando para iniciar em modo desenvolvimento
CMD ["pnpm", "run", "dev", "--host", "0.0.0.0"]

