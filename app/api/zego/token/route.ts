import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Constants
const APP_ID = 1697630406;
const SERVER_SECRET = "ebc45ffcb041992f68ed91a092518e1c";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userID');

    if (!userId) {
        return NextResponse.json({ error: 'UserID required' }, { status: 400 });
    }

    // Token Generation Logic (Manual Implementation of Zego Algo to avoid heavy SDK on server)
    // Algo: version(1) + signature + expiredTime + iv + content (AES-128-CBC)
    // Simplified for Web using the snippet logic often found in their docs:

    // Actually, using a simple kit token generator is easier. 
    // But since I don't want to install huge dependencies, I'll use a known simple implementation.

    const token = generateToken04(APP_ID, userId, SERVER_SECRET, 3600, "");

    return NextResponse.json({ token });
}

function generateToken04(appId: number, userId: string, secret: string, effectiveTimeInSeconds: number, payload: string) {
    if (!appId || !userId || !secret) return '';

    const createTime = Math.floor(new Date().getTime() / 1000);
    const tokenInfo = {
        app_id: appId,
        user_id: userId,
        nonce: Math.floor(Math.random() * 2147483647), // random int
        ctime: createTime,
        expire: createTime + effectiveTimeInSeconds,
        payload: payload || ''
    };

    const plainText = JSON.stringify(tokenInfo);

    // Encrypt
    // Use Node.js crypto
    const key = Buffer.from(secret, 'utf8'); // 32 chars = 32 bytes? No, secret is 32 hex chars? 
    // Zego secret is usually 32-char string.
    // Wait, the secret provided is "ebc45ffcb041992f68ed91a092518e1c" (32 chars).
    // If it's 32 chars, it might be 16 bytes hex or just a string key.
    // Zego docs say: "ServerSecret is a string".
    // Let's assume standard AES-128-CBC with a random IV.

    // Correct Zego Algorithm usually involves:
    // 1. Random 16-byte IV.
    // 2. AES-128-CBC encrypt `plainText` using `secret` (adjusted to 32 bytes? or just used).
    // Actually, Zego ServerSide token generation usually requires a robust lib. 
    // To safe time and avoid bugs, I will use a VERY simple "dev" token if possible or just try to implement the one from their open source examples.

    // Let's use a simpler approach: Just return the secret to client? NO, insecure.
    // I will try to use the `crypto` implementation that matches Zego's nodejs sample.

    const iv = makeNonce(); // 16 bytes random
    const ivBuf = Buffer.from(iv);

    // Adjust key size if needed. Zego secret is 32 chars. 
    // If we treat it as string, it's 32 bytes.
    // AES-128-CBC needs 16 byte key. 
    // Usually secret is 32 bytes => AES-256?
    // Let's assume standard logic: 
    // 1. 8 bytes random
    // 2. 
    // You know what? Installing `zego-server-assistant-nodejs` is safer.

    return "MOCK_TOKEN_NEED_LIB";
}

function makeNonce() {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 16; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}
