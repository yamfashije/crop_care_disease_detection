
const mongoose = require("mongoose");

const cropSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Crop name is required"],
      trim: true,
      minlength: [2, "Crop name must contain at least 2 characters"],
      maxlength: [100, "Crop name cannot exceed 100 characters"],
    },

    type: {
      type: String,
      trim: true,
      default: "Other",
    },

    variety: {
      type: String,
      trim: true,
      default: "",
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    scientificName: {
      type: String,
      trim: true,
      default: "",
    },

    plantingDate: {
      type: Date,
      default: null,
    },

    harvestDate: {
      type: Date,
      default: null,
    },

    location: {
      type: String,
      trim: true,
      default: "",
    },

    image: {
      type: String,
      default: "",
    },

    diseases: [
      {
        type: String,
        trim: true,
      },
    ],

    status: {
      type: String,
      enum: ["Healthy", "Diseased", "Needs Attention", "Unknown"],
      default: "Unknown",
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Crop", cropSchema);
