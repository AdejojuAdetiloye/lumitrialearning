import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import pricingRoutes from "./routes/pricing.js";
import parentRoutes from "./routes/parent.js";
import checkoutRoutes from "./routes/checkout.js";
import adminRoutes from "./routes/admin.js";
import instructorRoutes from "./routes/instructor.js";
import { flutterwaveWebhookHandler } from "./routes/flutterwaveWebhook.js";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

const allowedOrigins = (process.env.CORS_ORIGINS ?? "http://localhost:8080,http://127.0.0.1:8080,http://localhost:5173")
  .split(",")
  .map((s) => s.trim());

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(null, false);
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Client-Timezone"],
  })
);

app.post(
  "/api/checkout/flutterwave-webhook",
  express.raw({ type: "application/json" }),
  (req, res, next) => {
    void flutterwaveWebhookHandler(req, res).catch(next);
  },
);

app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/pricing", pricingRoutes);
app.use("/api/parent", parentRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/instructor", instructorRoutes);

app.use((_req, res) => res.status(404).json({ error: "Not found" }));

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
