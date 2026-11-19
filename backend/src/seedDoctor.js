const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Doctor = require("./models/Doctor");

async function seedDoctor() {
  // Accepts CLI arguments: node src/seedDoctor.js "Dr. Name" "email" "password" "specialization"
  // or environment variables: DOCTOR_NAME, DOCTOR_EMAIL, DOCTOR_PASSWORD, DOCTOR_SPECIALIZATION
  const args = process.argv.slice(2);
  const name = args[0] || process.env.DOCTOR_NAME || "Dr. Saurabh Sharma";
  const email = (args[1] || process.env.DOCTOR_EMAIL || "doctor@dermaslot.com").trim().toLowerCase();
  const password = args[2] || process.env.DOCTOR_PASSWORD || "12345678";
  const specialization = args[3] || process.env.DOCTOR_SPECIALIZATION || "Pediatric Dermatology";

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing in backend/.env");
  }

  console.log("Connecting to database...");
  await mongoose.connect(process.env.MONGO_URI);

  const hashedPassword = await bcrypt.hash(password, 10);

  // Idempotent upsert: updates existing doctor or inserts a new one
  const doctor = await Doctor.findOneAndUpdate(
    { email },
    {
      name,
      email,
      password: hashedPassword,
      specialization,
      role: "doctor",
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log("\n Doctor ready in MongoDB Atlas:");
  console.log(`   - Name:           ${doctor.name}`);
  console.log(`   - Email:          ${doctor.email}`);
  console.log(`   - Specialization: ${doctor.specialization}`);
  console.log(`   - Role:           ${doctor.role}`);
  console.log(`   - ID:             ${doctor._id}\n`);

  await mongoose.disconnect();
}

seedDoctor().catch(async (error) => {
  console.error("Doctor seed failed:", error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
