const express = require("express");
const multer = require("multer");
const Product = require("../models/Product");
const jwt = require("jsonwebtoken");
const router = express.Router();

// ====================== Middleware ======================
function auth(req, res, next) {
  const authHeader = req.headers["authorization"];
  console.log("Auth header:", req.headers["authorization"]);
  if (!authHeader) return res.status(401).json({ error: "No token" });

  const token = authHeader.split(" ")[1]; // ⚡ remove "Bearer "
  console.log("Token:", token);
  if (!token) return res.status(401).json({ error: "Token missing" });

  const JWT_SECRET = process.env.JWT_SECRET || "secretkey";
  jwt.verify(token, JWT_SECRET, (err, user) => {
    console.log("JWT verify error:", err);

    if (err) return res.status(400).json({ error: "Invalid token" });
    req.user = user; // decoded token { id, role }
    next();
  });
}

// Check if user is admin
function isAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied: Admins only" });
  }
  next();
}

// ====================== Multer Config ======================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // save images in uploads folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });

// ====================== Routes ======================

// ➤ Add product (Admin only)
router.post("/add", auth, isAdmin, upload.single("image"), async (req, res) => {
  try {
    const { medicineName, description, price } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : "";

    const newProduct = new Product({
      medicineName,
      description,
      price,
      image: imagePath
    });

    await newProduct.save();
    res.json({ message: "Product added successfully" });
  } catch (err) {
    console.error("Product add error:", err);
    res.status(500).json({ error: "Failed to add product" });
  }
});

// ➤ Get all products (Everyone)
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// ➤ Update product (Admin only)
router.put("/:id", auth, isAdmin, upload.single("image"), async (req, res) => {
  try {
    const { medicineName, description, price } = req.body;
    let updateData = { medicineName, description, price };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    await Product.findByIdAndUpdate(req.params.id, updateData);
    res.json({ message: "Product updated successfully" });
  } catch (err) {
    console.error("Product update error:", err);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// ➤ Delete product (Admin only)
router.delete("/:id", auth, isAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Product delete error:", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

module.exports = router;
