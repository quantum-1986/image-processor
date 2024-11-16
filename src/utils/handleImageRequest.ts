import { resolve } from "node:path";
import sharp from "npm:sharp@next";

function parseImageOptions(urlPath: string) {
    const segments = urlPath.split("/");
  
    let width: number | undefined;
    let quality: number | undefined;
    const imageSegments: string[] = [];
  
    for (const segment of segments) {
      if (segment.startsWith("w_")) {
        width = parseInt(segment.substring(2), 10);
      } else if (segment.startsWith("q_")) {
        quality = parseInt(segment.substring(2), 10);
      } else if (segment.endsWith(".webp") || segment.endsWith(".jpg") || segment.endsWith(".png")) {
        imageSegments.push(segment);
      } else if (imageSegments.length || (segment !== "" && segment !== "assets" && segment !== "images")) {
        imageSegments.push(segment);
      }
    }
  
    if (imageSegments.length === 0) {
      throw new Error("Image path not found in the URL");
    }
  
    const path = `/assets/images/${imageSegments.join("/")}`;
  
    return { width, quality, path };
}

export async function handleImageRequest(req: Request): Promise<Response> {
  const pathname = new URL(req.url).pathname;
  const { width, quality, path } = parseImageOptions(pathname);

  const imagePath = resolve(import.meta.dirname, `../${path}`);

  if (!(await Deno.stat(imagePath))) {
    return new Response("Image not found", { status: 404 });
  }

  try {
    const imageBuffer = await Deno.readFile(imagePath);
    let sharpInstance = sharp(imageBuffer);

    if (width) {
      sharpInstance = sharpInstance.resize({ width });
    }

    const optimizedBuffer = await sharpInstance.webp({ quality }).toBuffer();

    return new Response(optimizedBuffer, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error) {
    console.error("Error processing image:", error);
    return new Response("Error processing image", { status: 500 });
  }
}