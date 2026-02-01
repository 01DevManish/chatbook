import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "preploner";
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || "https://pub-2fd7832c2e474e9aa98b398c78d7d638.r2.dev";

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    console.warn("Missing Cloudflare R2 environment variables. Uploads may fail.");
}

const r2 = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID || "",
        secretAccessKey: R2_SECRET_ACCESS_KEY || "",
    },
});

export const uploadToR2 = async (file: Blob | Buffer, fileName: string, contentType: string): Promise<string> => {
    try {
        const buffer = file instanceof Blob ? Buffer.from(await file.arrayBuffer()) : file;

        const command = new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: fileName,
            Body: buffer,
            ContentType: contentType,
        });

        await r2.send(command);

        return `${R2_PUBLIC_URL}/${fileName}`;
    } catch (error) {
        console.error("Error uploading to R2:", error);
        throw new Error("Failed to upload file to storage.");
    }
};
