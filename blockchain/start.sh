#!/bin/sh
echo "Starting Hardhat node in the background..."
npx hardhat node --hostname 0.0.0.0 &
NODE_PID=$!

echo "Waiting for 5 seconds for the node to be fully ready..."
sleep 5

echo "Deploying the smart contract..."
npx hardhat ignition deploy ignition/modules/Voting.ts --network localhost

echo "Smart contract deployed successfully! Keeping the node alive..."
wait $NODE_PID
