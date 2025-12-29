import 'dotenv/config';
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
    await prisma.systemConfig.upsert({ where: { key: 'currentRole_title' }, update: { value: 'Automation Engineer' }, create: { key: 'currentRole_title', value: 'Automation Engineer' } });
    await prisma.systemConfig.upsert({ where: { key: 'currentRole_company' }, update: { value: 'Bynry' }, create: { key: 'currentRole_company', value: 'Bynry' } });
    await prisma.systemConfig.upsert({ where: { key: 'currentRole_status' }, update: { value: 'Intern' }, create: { key: 'currentRole_status', value: 'Intern' } });
    await prisma.systemConfig.upsert({ where: { key: 'currentRole_url' }, update: { value: 'https://www.linkedin.com/in/rushirajbirajdar/' }, create: { key: 'currentRole_url', value: 'https://www.linkedin.com/in/rushirajbirajdar/' } });
    console.log("Updated Role in DB");
}
main();
