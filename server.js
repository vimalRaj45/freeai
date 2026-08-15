const http = require("http");
const fs = require("fs");
const path = require("path");
const https = require("https");

// Native .env file loader (Zero external dependencies)
function loadEnv() {
  const envPath = path.join(__dirname, ".env");
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, "utf8");
      content.split("\n").forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          const eqIdx = trimmed.indexOf("=");
          if (eqIdx !== -1) {
            const key = trimmed.slice(0, eqIdx).trim();
            const val = trimmed.slice(eqIdx + 1).trim();
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      });
    } catch (e) {
      console.warn("Could not read .env file:", e.message);
    }
  }
}

loadEnv();

const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0";
const HTML_PATH = path.join(__dirname, "index.html");

const ENV_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || "";
const ENV_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || "";
const APP_PASSWORD = process.env.APP_PASSWORD || "vimalraj45";

const server = http.createServer((req, res) => {
  // CORS & Security Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // Health check endpoint for Render
  if (req.url === "/healthz" || req.url === "/ping") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", timestamp: new Date().toISOString() }));
    return;
  }

  // Secure Password Authentication Endpoint
  if (req.url === "/api/login" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", () => {
      try {
        const { password } = JSON.parse(body || "{}");
        if (password === APP_PASSWORD) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({
            success: true,
            hasEnvAccount: Boolean(ENV_ACCOUNT_ID),
            hasEnvToken: Boolean(ENV_API_TOKEN)
          }));
        } else {
          res.writeHead(401, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: "Invalid password" }));
        }
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: "Invalid request payload" }));
      }
    });
    return;
  }

  // Configuration check endpoint
  if (req.url === "/api/config" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      hasEnvAccount: Boolean(ENV_ACCOUNT_ID),
      hasEnvToken: Boolean(ENV_API_TOKEN)
    }));
    return;
  }

  // Serve static HTML index
  if (req.url === "/" || req.url === "/index.html") {
    fs.readFile(HTML_PATH, (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Server Error: Unable to read index.html");
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html; charset=UTF-8" });
      res.end(data);
    });
    return;
  }

  // API Proxy endpoint to execute Cloudflare AI models securely (supports JSON and Uint8 Array media)
  if (req.url === "/api/run" && req.method === "POST") {
    const chunks = [];
    req.on("data", (chunk) => { chunks.push(chunk); });

    req.on("end", () => {
      try {
        const bodyBuffer = Buffer.concat(chunks);
        const parsed = JSON.parse(bodyBuffer.toString("utf8") || "{}");
        
        // Priority: Client Provided Credential > Server Environment Variable
        const accountId = (parsed.accountId && parsed.accountId.trim()) ? parsed.accountId.trim() : ENV_ACCOUNT_ID;
        const token = (parsed.token && parsed.token.trim()) ? parsed.token.trim() : ENV_API_TOKEN;
        const model = parsed.model;
        let payload = parsed.payload;

        if (!accountId || !token) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({
            success: false,
            errors: [{ message: "No Cloudflare Account ID or API Token found. Please enter them in Settings or configure CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in your .env / Render environment." }]
          }));
          return;
        }

        if (!model) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({
            success: false,
            errors: [{ message: "Model identifier is required." }]
          }));
          return;
        }

        // Process Base64 media into Uint8Array for models requiring binary inputs (Whisper / LLaVA / ResNet)
        if (payload && payload.image_base64) {
          const base64Clean = payload.image_base64.replace(/^data:image\/\w+;base64,/, "");
          const imgBuf = Buffer.from(base64Clean, "base64");
          payload.image = Array.from(imgBuf);
          delete payload.image_base64;
        }

        if (payload && payload.audio_base64) {
          const base64Clean = payload.audio_base64.replace(/^data:audio\/\w+;base64,/, "");
          const audioBuf = Buffer.from(base64Clean, "base64");
          payload.audio = Array.from(audioBuf);
          delete payload.audio_base64;
        }

        const cleanModel = model.startsWith("/") ? model.substring(1) : model;
        const targetUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${cleanModel}`;
        const postData = JSON.stringify(payload);

        const cfReq = https.request(
          targetUrl,
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
              "Content-Length": Buffer.byteLength(postData)
            }
          },
          (cfRes) => {
            const resChunks = [];
            cfRes.on("data", (chunk) => { resChunks.push(chunk); });

            cfRes.on("end", () => {
              const buffer = Buffer.concat(resChunks);
              const contentType = cfRes.headers["content-type"] || "application/json";

              if (contentType.startsWith("image/")) {
                const base64Data = buffer.toString("base64");
                res.writeHead(cfRes.statusCode || 200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({
                  success: true,
                  result: {
                    media_type: contentType,
                    base64: `data:${contentType};base64,${base64Data}`
                  }
                }));
                return;
              }

              if (contentType.startsWith("audio/")) {
                const base64Data = buffer.toString("base64");
                res.writeHead(cfRes.statusCode || 200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({
                  success: true,
                  result: {
                    media_type: contentType,
                    audio_base64: `data:${contentType};base64,${base64Data}`
                  }
                }));
                return;
              }

              res.writeHead(cfRes.statusCode || 200, { "Content-Type": contentType });
              res.end(buffer);
            });
          }
        );

        cfReq.on("error", (e) => {
          res.writeHead(502, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, errors: [{ message: "Cloudflare API connection failed: " + e.message }] }));
        });

        cfReq.write(postData);
        cfReq.end();
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, errors: [{ message: "Invalid JSON request: " + err.message }] }));
      }
    });
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not Found" }));
});

server.listen(PORT, HOST, () => {
  console.log(`Cloudflare All-In-One AI Platform is live on http://${HOST}:${PORT}`);
});
