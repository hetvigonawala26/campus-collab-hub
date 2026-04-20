const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const dns = require("node:dns");

const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const userRoutes = require("./routes/userRoutes");
const { notFound } = require("./middleware/notFound");
const { errorHandler } = require("./middleware/errorHandler");

// dotenv.config();
dotenv.config({ path: "../.env" });

const app = express();
app.locals.dbReady = false;

app.use(helmet());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-7",
    legacyHeaders: false
  })
);

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    name: "campus-collab-hub-api",
    db: {
      ready: Boolean(req.app.locals.dbReady),
      state: mongoose.connection?.readyState ?? 0
    }
  });
});

// If DB isn't reachable, fail fast for DB-dependent routes instead of hanging/crashing.
app.use((req, res, next) => {
  if (req.path === "/api/health") return next();
  if (!req.path.startsWith("/api/")) return next();
  if (req.app.locals.dbReady) return next();
  return res.status(503).json({
    ok: false,
    error: "Database not connected. Check MONGODB_URI and network access."
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/users", userRoutes);

app.use(notFound);
app.use(errorHandler);

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function parseMongoUri(mongoUri) {
  // Supports mongodb:// and mongodb+srv:// URIs for the pieces we need.
  // We avoid URL() here because mongodb URIs aren't fully URL-standard.
  const m = /^(mongodb(?:\+srv)?):\/\/([^@]+@)?([^/?]+)(\/[^?]*)?(\?.*)?$/.exec(mongoUri);
  if (!m) return null;
  const scheme = m[1]; // mongodb or mongodb+srv
  const auth = (m[2] || "").replace(/@$/, ""); // may include user:pass
  const hosts = m[3]; // host or host list
  const pathname = (m[4] || "").replace(/^\//, ""); // db (may be empty)
  const query = (m[5] || "").replace(/^\?/, "");
  return { scheme, auth, hosts, pathname, query };
}

function mergeQueryStrings(a, b) {
  const params = new URLSearchParams();
  if (a) new URLSearchParams(a).forEach((v, k) => params.set(k, v));
  if (b) new URLSearchParams(b).forEach((v, k) => params.set(k, v));
  const s = params.toString();
  return s ? `?${s}` : "";
}

async function resolveSrvAndTxt(hostname) {
  const resolver = new dns.promises.Resolver();
  // Use public resolvers to bypass flaky/blocked local DNS SRV behavior.
  resolver.setServers(["1.1.1.1", "8.8.8.8", "9.9.9.9"]);

  const srvName = `_mongodb._tcp.${hostname}`;
  const srvRecords = await resolver.resolveSrv(srvName);
  const hosts = srvRecords
    .sort((a, b) => (a.priority - b.priority) || (b.weight - a.weight))
    .map((r) => `${r.name}:${r.port}`);

  let txtQuery = "";
  try {
    const txt = await resolver.resolveTxt(hostname);
    // Atlas uses a single TXT record string like "authSource=admin&replicaSet=..."
    const flat = txt.flat().filter(Boolean).join("");
    txtQuery = flat || "";
  } catch {
    // TXT is optional; ignore if it fails.
  }

  return { hosts, txtQuery };
}

async function normalizeMongoUri(uri) {
  const parsed = parseMongoUri(uri);
  if (!parsed) return uri;
  if (parsed.scheme !== "mongodb+srv") return uri;

  const { auth, hosts: hostname, pathname: dbName, query } = parsed;
  const { hosts, txtQuery } = await resolveSrvAndTxt(hostname);
  const mergedQuery = mergeQueryStrings(txtQuery, query);
  const dbPart = dbName ? `/${dbName}` : "";
  const authPart = auth ? `${auth}@` : "";
  return `mongodb://${authPart}${hosts.join(",")}${dbPart}${mergedQuery}`;
}

function listenWithFallback(appInstance, startPort, maxAttempts = 10) {
  let attempt = 0;

  return new Promise((resolve, reject) => {
    const tryListen = (port) => {
      attempt += 1;
      const server = appInstance.listen(port);

      server.once("listening", () => resolve(server));
      server.once("error", (err) => {
        if (err && err.code === "EADDRINUSE" && attempt < maxAttempts) {
          try {
            server.close(() => tryListen(port + 1));
          } catch {
            tryListen(port + 1);
          }
          return;
        }
        reject(err);
      });
    };

    tryListen(startPort);
  });
}

async function connectWithRetry(uri) {
  let attempt = 0;
  let printedSrvHint = false;
  // Keep trying in dev so the API can stay up while network/DB comes online.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    attempt += 1;
    try {
      const normalized = await normalizeMongoUri(uri);
      await mongoose.connect(normalized, { serverSelectionTimeoutMS: 5000 });
      app.locals.dbReady = true;
      // eslint-disable-next-line no-console
      console.log("MongoDB connected");
      return;
    } catch (err) {
      app.locals.dbReady = false;
      if (
        !printedSrvHint &&
        typeof uri === "string" &&
        uri.startsWith("mongodb+srv://") &&
        String(err?.message || "").includes("querySrv")
      ) {
        printedSrvHint = true;
        // eslint-disable-next-line no-console
        console.error(
          "Hint: your network/DNS may block MongoDB SRV lookups. Try using the non-SRV Atlas URI format (mongodb://host1,host2,host3/...)."
        );
      }
      // eslint-disable-next-line no-console
      console.error("MongoDB connection failed:", err?.message || err);
      const backoffMs = Math.min(30000, 1000 * 2 ** Math.min(attempt, 5));
      await sleep(backoffMs);
    }
  }
}

async function start() {
  const basePort = Number(process.env.PORT || 5000);
  const server = await listenWithFallback(app, basePort, 25);
  const actualPort = server.address()?.port ?? basePort;
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${actualPort}`);

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    // eslint-disable-next-line no-console
    console.warn("MONGODB_URI is not set. API will run without DB.");
    return;
  }

  void connectWithRetry(uri);
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});

