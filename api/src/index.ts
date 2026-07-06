import express from "express";
import cors from "cors";
import { submitRouter } from "./routes/submit";

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api", submitRouter);

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
if (process.env.VERCEL !== "1") {
  app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
}

export default app;
