FROM node:20-alpine AS builder
WORKDIR /app
# Install dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install
# Generate Prisma client
RUN npx prisma generate
# Copy source and build
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3001
CMD ["npm", "run", "start:prod"]
