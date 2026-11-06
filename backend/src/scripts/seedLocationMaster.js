const dotenv = require("dotenv");
const connectDB = require("../config/db");
const { seedLocationMaster } = require("../seeders/locationMasterSeeder");

dotenv.config();

async function run() {
  try {
    const shouldForce = process.argv.includes("--force");
    await connectDB();
    await seedLocationMaster({ force: shouldForce, log: true });
    process.exit(0);
  } catch (error) {
    console.error("Location master seeding failed:", error.message);
    process.exit(1);
  }
}

run();
