const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const locationRoutes = require("./routes/locationRoutes");
const propertyEnquiryRoutes = require("./routes/propertyEnquiryRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const connectDB = require("./config/db");
const { seedLocationMaster } = require("./seeders/locationMasterSeeder");

dotenv.config();

function validateRequiredEnv() {
  const required = ["MONGODB_URI", "JWT_SECRET"];
  const missing = required.filter((key) => !process.env[key] || !String(process.env[key]).trim());

  if (missing.length > 0) {
    throw new Error(`Missing required env variables: ${missing.join(", ")}`);
  }
}

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "20mb" }));

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
    data: null,
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/property-enquiries", propertyEnquiryRoutes);
app.use("/api/payments", paymentRoutes);


app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    data: null,
  });
});

async function startServer() {
  try {
    validateRequiredEnv();
    await connectDB();
    const shouldSeedOnStart = String(process.env.SEED_LOCATION_MASTER_ON_START || "true")
      .trim()
      .toLowerCase();
    if (["true", "1", "yes"].includes(shouldSeedOnStart)) {
      await seedLocationMaster({ force: false, log: true });
    }
    app.listen(port, () => {
      console.log(`Backend server started on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
