import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
    await prisma.deployment.deleteMany({});
    console.log("Deleted all deployments.");
}
main();
