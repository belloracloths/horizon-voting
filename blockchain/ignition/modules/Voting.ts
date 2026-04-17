import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const VotingModule = buildModule("VotingModule", (m) => {
  const forwarder = m.contract("MyForwarder");

  const voting = m.contract("Voting", [forwarder]);

  return { forwarder, voting };
});

export default VotingModule;