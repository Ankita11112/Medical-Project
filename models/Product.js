const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    medicineName: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String },

    // 🩺 Newly added fields
    dosageForm: { type: String, trim: true }, // e.g., Tablet, Liquid, Capsule
    uses: { type: String, trim: true },       // e.g., "Pain relief, fever"
    manufacturer: { type: String, trim: true }, // e.g., "Cipla Ltd."
    expiryDate: { type: Date },               // expiry date of medicine
    drugNumber: { type: String, trim: true }  // unique medicine code/number
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
