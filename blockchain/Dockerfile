FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

# Make the start script executable
RUN sed -i 's/\r$//' start.sh && chmod +x start.sh

# Expose Hardhat default node port
EXPOSE 8545

# Start local hardhat node and deploy contracts
CMD ["./start.sh"]
