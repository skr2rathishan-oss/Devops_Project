const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

app.get("/health", (req, res) => res.status(200).json({ success: true, status: "ok" }));

app.use("/api/auth", authRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
