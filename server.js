const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const connectDB = require("./config/db");

dotenv.config();

const app = express();
connectDB();

// Middleware
app.use(cors(
  { origin: "*", credentials: true }
));
app.use(express.json());
app.use(helmet());
app.use(morgan("dev"));

// Serve uploaded images
app.use("/uploads", express.static("uploads"));

// Serve static frontend files
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));

// Serve frontend HTML files for non-API routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
