// backend/prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@horizoncampus.edu.lk';
  const plainPassword = 'AdminPassword123!'; 

  const existingAdmin = await prisma.admin.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('Admin already exists!');
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(plainPassword, salt);

  const admin = await prisma.admin.create({
    data: {
      name: 'Super Admin',
      email: adminEmail,
      password: hashedPassword,
    },
  });

  console.log('Admin Created Successfully!');
  console.log(`Email: ${adminEmail}`);
  console.log(`Password: ${plainPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });