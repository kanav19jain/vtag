import dns from "node:dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

import { createApp } from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";

const app = createApp();

await connectDB();

app.listen(env.port, () => {
  console.log(`[vtag] API listening on http://localhost:${env.port}`);
  console.log(`[vtag] Client origin: ${env.clientUrls.join(", ")}`);
  console.log("[vtag] Demo mode: no real phone calls are ever placed");
});
