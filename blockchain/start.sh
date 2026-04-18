#!/bin/sh
echo "Creating necessary directories for persistent storage..."
mkdir -p /app/ganache_data
mkdir -p /app/ignition/deployments

echo "Starting Ganache node in the background..."
npm run node:ganache &
NODE_PID=$!

echo "Waiting for 5 seconds for Ganache to be fully ready..."
sleep 5

echo "Deploying the smart contract (skips if already deployed)..."
npx hardhat ignition deploy ignition/modules/Voting.ts --network localhost

echo "Smart contract deployed successfully! Keeping Ganache alive..."
wait $NODE_PID
