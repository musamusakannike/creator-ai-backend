const { savedTitle, savedWriting, savedSeo } = require("../models/savesModel");

const getTitlesController = async function (req, res) {
  try {
    const savedTitles = await savedTitle.find({ user: req.user._id });
    res.status(200).json({ status: "OK", savedTitles });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ status: "Error", message: "Failed to get saved titles" });
  }
};

const getWritingsController = async function (req, res) {
  try {
    const savedWritings = await savedWriting.find({ user: req.user._id });
    res.status(200).json({ status: "OK", savedWritings });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ status: "Error", message: "Failed to get saved writing" });
  }
};

const getSeosController = async function (req, res) {
  try {
    const savedSeos = await savedSeo.find({ user: req.user._id });
    res.status(200).json({ status: "OK", savedSeos });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ status: "Error", message: "Failed to get saved SEO" });
  }
};

const saveContentController = async function (req, res) {
  const { content } = req.body;
  const type = req.params.type;

  console.log(req.user);

  if (!req.user) {
    return res
      .status(401)
      .json({ status: "Error", message: "Unauthorized user" });
  }

  if (typeof content !== "string") {
    return res
      .status(400)
      .json({ status: "Error", message: "Content must be a string" });
  }

  try {
    if (type === "title") {
      // Check if title already exists for this user
      const existingTitle = await savedTitle.findOne({
        user: req.user._id,
        title: content,
      });
      if (existingTitle) {
        return res
          .status(400)
          .json({ status: "Error", message: "Title already exists" });
      }
      const newTitle = new savedTitle({ user: req.user._id, title: content });
      await newTitle.save();
      res
        .status(201)
        .json({ status: "OK", message: "Title saved successfully" });
    } else if (type === "writing") {
      // Check if writing already exists for this user
      const existingWriting = await savedWriting.findOne({
        user: req.user._id,
        writing: content,
      });
      if (existingWriting) {
        return res
          .status(400)
          .json({ status: "Error", message: "Writing already exists" });
      }
      const newWriting = new savedWriting({
        user: req.user._id,
        writing: content,
      });
      await newWriting.save();
      res
        .status(201)
        .json({ status: "OK", message: "Writing saved successfully" });
    } else if (type === "seo") {
      // Check if SEO already exists for this user
      const existingSeo = await savedSeo.findOne({
        user: req.user._id,
        seo: content,
      });
      if (existingSeo) {
        return res
          .status(400)
          .json({ status: "Error", message: "SEO already exists" });
      }
      const newSeo = new savedSeo({ user: req.user._id, seo: content });
      await newSeo.save();
      res.status(201).json({ status: "OK", message: "SEO saved successfully" });
    } else {
      return res
        .status(400)
        .json({ status: "Error", message: "Invalid type specified" });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ status: "Error", message: "Failed to save content" });
  }
};

const deleteContentController = async function (req, res) {
  const type = req.params.type;
  const id = req.params.id;

  if (!req.user) {
    return res
      .status(401)
      .json({ status: "Error", message: "Unauthorized user" });
  }

  try {
    let deletionResponse;

    if (type === "title") {
      deletionResponse = await savedTitle.findOneAndDelete({
        _id: id,
        user: req.user._id,
      });
    } else if (type === "writing") {
      deletionResponse = await savedWriting.findOneAndDelete({
        _id: id,
        user: req.user._id,
      });
    } else if (type === "seo") {
      deletionResponse = await savedSeo.findOneAndDelete({
        _id: id,
        user: req.user._id,
      });
    } else {
      return res
        .status(400)
        .json({ status: "Error", message: "Invalid type specified" });
    }

    if (!deletionResponse) {
      return res.status(404).json({
        status: "Error",
        message: `${type.charAt(0).toUpperCase() + type.slice(1)} not found`,
      });
    }

    res.status(200).json({
      status: "OK",
      message: `${
        type.charAt(0).toUpperCase() + type.slice(1)
      } deleted successfully`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "Error", message: "Error occurred" });
  }
};

module.exports = {
  getTitlesController,
  getWritingsController,
  getSeosController,
  saveContentController,
  deleteContentController,
};
