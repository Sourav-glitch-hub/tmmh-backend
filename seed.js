// ============================================================
// seed.js
// Database seeder — creates the initial admin account
// Run once: node seed.js
// To destroy all data: node seed.js --destroy
// ============================================================
// const dns = require("dns");
// dns.setServers(["8.8.8.8", "8.8.4.4"]);
const dotenv = require("dotenv");
const mongoose = require("mongoose");
dotenv.config();

const connectDB = require("./config/db");
const User = require("./models/User");
const RepairRequest = require("./models/RepairRequest");
const Product = require("./models/Product");

// ─── Sample data ─────────────────────────────────────────────────────────────

const adminUser = {
  name: process.env.ADMIN_NAME || "Shop Admin",
  email: process.env.ADMIN_EMAIL || "admin@shopname.com",
  password: process.env.ADMIN_PASSWORD || "Admin@123456",
  role: "admin",
};

const sampleProducts = [
  {
    name: "Premium Tempered Glass - Universal",
    category: "tempered glass",
    description:
      "9H hardness tempered glass screen protector. Crystal clear, oleophobic coating, easy to apply.",
    available: true,
  },
  {
    name: "Silicone Protective Cover - iPhone Series",
    category: "cover",
    description:
      "Soft silicone back cover with raised edges for screen and camera protection. Available for all iPhone models.",
    available: true,
  },
  {
    name: "20W Fast Charger Adapter",
    category: "charger",
    description:
      "USB-C 20W PD fast charging adapter. Compatible with all modern smartphones. Compact travel design.",
    available: true,
  },
  {
    name: "Wireless Earbuds Pro",
    category: "earphone",
    description:
      "True wireless stereo earbuds with 6-hour battery life, touch controls, and IPX4 water resistance.",
    available: true,
  },
  {
    name: "10000mAh Slim Power Bank",
    category: "powerbank",
    description:
      "Ultra-slim 10000mAh power bank with dual USB-A and USB-C output. LED battery indicator. Airline approved.",
    available: true,
  },
  {
    name: "Rugged Armor Case - Samsung Galaxy",
    category: "cover",
    description:
      "Military-grade drop protection case with carbon fiber texture. Raised camera protection for Samsung Galaxy series.",
    available: false,
  },
];

const sampleRepairs = [
  {
    repairId: "R1001",
    customerName: "Rafi Ahmed",
    phoneNumber: "01712345678",
    deviceBrand: "Samsung",
    deviceModel: "Galaxy S22",
    problemType: "screen",
    problemDescription:
      "The screen has cracks on the top right corner and touch is not responding in that area.",
    status: "Completed",
  },
  {
    repairId: "R1002",
    customerName: "Tania Islam",
    phoneNumber: "01898765432",
    deviceBrand: "Apple",
    deviceModel: "iPhone 13",
    problemType: "battery",
    problemDescription:
      "Battery drains very quickly — from 100% to 20% in about 3 hours with light usage.",
    status: "Repairing",
  },
  {
    repairId: "R1003",
    customerName: "Karim Hossain",
    phoneNumber: "01611223344",
    deviceBrand: "Xiaomi",
    deviceModel: "Redmi Note 11",
    problemType: "charging",
    problemDescription:
      "The phone only charges when the cable is held at a specific angle. Charging port seems loose.",
    status: "Checking",
  },
  {
    repairId: "R1004",
    customerName: "Sumaiya Akter",
    phoneNumber: "01755667788",
    deviceBrand: "Oppo",
    deviceModel: "Reno 8",
    problemType: "camera",
    problemDescription:
      "Rear camera produces blurry images and the camera app crashes occasionally.",
    status: "Received",
  },
];

// ─── Seeder functions ─────────────────────────────────────────────────────────

const seedData = async () => {
  try {
    await connectDB();
    console.log("\n🌱 Starting database seeding...\n");

    // ── Admin user ────────────────────────────────────────────────────────
    const existingAdmin = await User.findOne({ email: adminUser.email });
    if (existingAdmin) {
      console.log(
        `⚠️  Admin already exists: ${adminUser.email} (skipping creation)`
      );
    } else {
      const admin = await User.create(adminUser);
      console.log(`✅ Admin created: ${admin.email} (role: ${admin.role})`);
    }

    // ── Products ──────────────────────────────────────────────────────────
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const products = await Product.insertMany(sampleProducts);
      console.log(`✅ ${products.length} sample products added.`);
    } else {
      console.log(`⚠️  Products already exist (${productCount} found). Skipping.`);
    }

    // ── Sample repair requests ────────────────────────────────────────────
    const repairCount = await RepairRequest.countDocuments();
    if (repairCount === 0) {
      const repairs = await RepairRequest.insertMany(sampleRepairs);
      console.log(`✅ ${repairs.length} sample repair requests added.`);
    } else {
      console.log(
        `⚠️  Repair requests already exist (${repairCount} found). Skipping.`
      );
    }

    console.log("\n✅ Seeding complete!\n");
    console.log("─────────────────────────────────────────");
    console.log("  Admin Login Credentials:");
    console.log(`  Email   : ${adminUser.email}`);
    console.log(`  Password: ${process.env.ADMIN_PASSWORD || "Admin@123456"}`);
    console.log("─────────────────────────────────────────\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();
    console.log("\n💣 Destroying all data...\n");

    await Promise.all([
      User.deleteMany(),
      RepairRequest.deleteMany(),
      Product.deleteMany(),
    ]);

    console.log("✅ All data deleted from the database.\n");
    process.exit(0);
  } catch (error) {
    console.error("❌ Destroy failed:", error.message);
    process.exit(1);
  }
};

// ─── Run based on CLI argument ────────────────────────────────────────────────
if (process.argv[2] === "--destroy") {
  destroyData();
} else {
  seedData();
}