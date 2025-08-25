// import { NextResponse } from "next/server";
// import cloudinary from "@/lib/cloudinary";
// import { writeFile } from "fs/promises";
// import { tmpdir } from "os";
// import path from "path";

// export const POST = async (req: Request) => {
//   try {
//     const formData = await req.formData();
//     const file = formData.get("file") as File;

//     if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

//     // Save the file temporarily
//     const bytes = await file.arrayBuffer();
//     const buffer = Buffer.from(bytes);
//     const tempPath = path.join(tmpdir(), file.name);
//     await writeFile(tempPath, buffer);

//     // Upload to Cloudinary
//     const result = await cloudinary.uploader.upload(tempPath, {
//       resource_type: "video", // required for audio files
//       folder: "audio_uploads",
//     });

//     return NextResponse.json({ url: result.secure_url });
//   } catch (error) {
//     console.error("Cloudinary Upload Error:", error);
//     return NextResponse.json({ error: "Upload failed" }, { status: 500 });
//   }
// };
// src/app/api/upload/route.ts
// /app/api/upload/route.ts
import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'uploads',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (error: any) {
    console.error('Upload failed:', error); // ✅ Check this output
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}
