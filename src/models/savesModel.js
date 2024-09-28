const mongoose = require("mongoose");

const savedTitleSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
});

const savedWritingSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  writing: {
    type: String,
    required: true,
  },
});

const savedSeoSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  seo: {
    type: String,
    required: true,
  },
});

const savedTitle = mongoose.model("SavedTitle", savedTitleSchema);
const savedWriting = mongoose.model("SavedWriting", savedWritingSchema);
const savedSeo = mongoose.model("SavedSeo", savedSeoSchema);

module.exports = { savedTitle, savedWriting, savedSeo };
