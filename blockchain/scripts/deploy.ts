import { ethers } from "hardhat";

async function main() {
  const Forwarder = await ethers.getContractFactory("MyForwarder");
  const forwarder = await Forwarder.deploy();
  await forwarder.waitForDeployment();
  const forwarderAddress = await forwarder.getAddress();
  console.log("MyForwarder deployed to:", forwarderAddress);

  const Voting = await ethers.getContractFactory("Voting");
  const voting = await Voting.deploy(forwarderAddress);
  await voting.waitForDeployment();
  console.log("Voting deployed to:", await voting.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
