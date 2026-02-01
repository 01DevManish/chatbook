import { NextRequest, NextResponse } from "next/server";
import { uploadToR2 } from "@/lib/r2";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as Blob;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Validate mime type (audio/webm, audio/mp4, audio/ogg, audio/wav)
        if (!file.type.startsWith("audio/")) {
            return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
        }

        const extension = file.type.split("/")[1].split(";")[0] || "webm";
        const fileName = `voice/${uuidv4()}.${extension}`;

        const url = await uploadToR2(file, fileName, file.type);

        return NextResponse.json({ url, type: "audio" });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
