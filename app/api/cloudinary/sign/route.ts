import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
    try {
        const { paramsToSign } = await request.json();
        const apiSecret = process.env.CLOUDINARY_API_SECRET;

        if (!apiSecret) {
            return NextResponse.json({ error: 'Missing Cloudinary API Secret' }, { status: 500 });
        }

        // Sort parameters by key
        const sortedKeys = Object.keys(paramsToSign).sort();

        // Create string to sign: key=value&key=value...
        const stringToSign = sortedKeys
            .map((key) => `${key}=${paramsToSign[key]}`)
            .join('&');

        // Append API secret
        const signatureString = stringToSign + apiSecret;

        // Generate SHA-1 signature
        const signature = crypto
            .createHash('sha1')
            .update(signatureString)
            .digest('hex');

        return NextResponse.json({ signature });
    } catch (error) {
        console.error('Error signing Cloudinary request:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
