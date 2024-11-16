import { handleImageRequest } from "./utils/handleImageRequest.ts";

const PORT = 3000;
console.log(`Server running on http://localhost:${PORT}`);

Deno.serve({ port: PORT }, async (req: Request) => {
  const url = new URL(req.url);

  if (url.pathname.startsWith("/assets/images/")) {
    return await handleImageRequest(req);
  }

  return new Response("Not Found", { status: 404 });
});
