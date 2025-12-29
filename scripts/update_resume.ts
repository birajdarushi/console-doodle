import 'dotenv/config';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const resumeUrl = process.argv[2];

if (!resumeUrl) {
    console.error("Please provide a resume URL as an argument.");
    process.exit(1);
}

async function main() {
    await prisma.systemConfig.upsert({
        where: { key: 'resume_url' },
        update: { value: resumeUrl },
        create: { key: 'resume_url', value: resumeUrl }
    });
    console.log(`✅ Resume URL updated to: ${resumeUrl}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
