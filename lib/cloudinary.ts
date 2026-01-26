export const uploadToCloudinary = async (file: File): Promise<string> => {
    try {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY || "253667214247696"; // Fallback if env not eager loaded in client

        if (!cloudName) throw new Error("Missing Cloudinary Cloud Name");

        // 1. Prepare parameters for signature
        const timestamp = Math.round(new Date().getTime() / 1000);
        const paramsToSign = {
            timestamp: timestamp,
            folder: "chat-images", // Optional: organize in a folder
        };

        // 2. Get Signature from our Backend
        const response = await fetch("/api/cloudinary/sign", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paramsToSign }),
        });

        const data = await response.json();
        if (!data.signature) throw new Error("Failed to get signature");

        // 3. Upload to Cloudinary
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", apiKey);
        formData.append("timestamp", timestamp.toString());
        formData.append("signature", data.signature);
        formData.append("folder", "chat-images");

        const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

        const uploadResponse = await fetch(uploadUrl, {
            method: "POST",
            body: formData,
        });

        const uploadResult = await uploadResponse.json();
        if (uploadResult.secure_url) {
            return uploadResult.secure_url;
        } else {
            console.error("Cloudinary upload error:", uploadResult);
            throw new Error("Failed to upload image to Cloudinary");
        }
    } catch (error) {
        console.error("Error uploading to Cloudinary:", error);
        throw error;
    }
};
