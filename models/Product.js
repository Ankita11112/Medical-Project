const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
    medicineName: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String }
},
{ timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
