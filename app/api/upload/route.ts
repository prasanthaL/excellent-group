import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const folder = (formData.get("folder") as string) || "others"; // Default to others if not provided

        if (!file || file.size === 0) {
            return NextResponse.json({ error: "No file provided." }, { status: 400 });
        }

        // Validate type
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: "Only image files are allowed." }, { status: 400 });
        }

        // Max 5 MB
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: "File size must be under 5MB." }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create specific folder dir
        const targetDir = path.join(process.cwd(), "public", "uploads", folder);
        await mkdir(targetDir, { recursive: true });

        // Unique filename
        const ext = file.name.split(".").pop();
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const filepath = path.join(targetDir, filename);

        await writeFile(filepath, buffer);

        // Return URL with folder path
        return NextResponse.json({ url: `/uploads/${folder}/${filename}` });
    } catch (error) {
        console.error("[/api/upload]", error);
        return NextResponse.json({ error: "Upload failed." }, { status: 500 });
    }
}
