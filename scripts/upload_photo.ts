import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function uploadProfilePhoto(imagePath: string) {
    try {
        // Check if file exists
        if (!fs.existsSync(imagePath)) {
            console.error(`❌ File not found: ${imagePath}`);
            process.exit(1);
        }

        console.log(`📸 Processing image: ${imagePath}`);

        // Compress and resize image to 200x200px
        const compressedImage = await sharp(imagePath)
            .resize(200, 200, {
                fit: 'cover',
                position: 'center'
            })
            .jpeg({ quality: 80 })
            .toBuffer();

        console.log(`✅ Image compressed: ${compressedImage.length} bytes`);

        // Delete old photos
        const deletedCount = await prisma.profilePhoto.deleteMany({});
        if (deletedCount.count > 0) {
            console.log(`🗑️  Deleted ${deletedCount.count} old photo(s)`);
        }

        // Store new photo
        await prisma.profilePhoto.create({
            data: {
                imageData: compressedImage,
                mimeType: 'image/jpeg'
            }
        });

        console.log(`✅ Profile photo uploaded successfully!`);
        console.log(`📊 Size: ${(compressedImage.length / 1024).toFixed(2)} KB`);

    } catch (error) {
        console.error('❌ Error uploading photo:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Get image path from command line arguments
const imagePath = process.argv[2];

if (!imagePath) {
    console.error('❌ Usage: npx tsx scripts/upload_photo.ts <path-to-image>');
    process.exit(1);
}

uploadProfilePhoto(imagePath);
