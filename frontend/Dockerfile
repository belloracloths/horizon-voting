FROM node:20-alpine AS builder
WORKDIR /app
# Install dependencies
COPY package*.json ./
RUN npm install
# Copy source and build
COPY . .
ENV BACKEND_URL=http://backend:3001
ENV RPC_URL=http://blockchain:8545
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["npm", "start"]
