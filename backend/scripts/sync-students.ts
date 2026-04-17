import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function syncStudents() {
  console.log("=== Starting Student Sync to Blockchain ===");
  try {
    const students = await prisma.user.findMany();

    if (students.length === 0) {
      console.log("No students found in DB.");
      return;
    }

    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const adminWallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY!, provider);
    
    // Read ABI
    const abiPath = path.join(__dirname, '..', '..', 'blockchain', 'artifacts', 'contracts', 'Voting.sol', 'Voting.json');
    const contractJson = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
    const contract = new ethers.Contract(process.env.VOTING_ADDRESS!, contractJson.abi, adminWallet);

    console.log(`Found ${students.length} students. Whitelisting...`);

    for (const s of students) {
      if (s.walletAddress) {
        console.log(`Checking ${s.fullName} (${s.walletAddress})...`);
        const isWhitelisted = await contract.isWhitelisted(s.walletAddress);
        if (!isWhitelisted) {
          console.log(`Adding ${s.fullName}...`);
          try {
            const tx = await contract.whitelistVoter(s.walletAddress);
            await tx.wait();
            console.log(`✅ Success for ${s.fullName}`);
          } catch(e: any) {
            console.log(`❌ Failed for ${s.fullName}`, e.message);
          }
        } else {
          console.log(`⚡ Already whitelisted: ${s.fullName}`);
        }
      }
    }
  } catch (error) {
    console.error("Sync Error:", error);
  } finally {
    await prisma.$disconnect();
    console.log("=== Sync Finished ===");
  }
}

syncStudents();
