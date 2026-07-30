const Contact = require("../models/Contact");

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
const submitContactForm = async (req, res, next) => {
  try {
    const { name, email, phone, city, service, message } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields (name, email, phone, message)",
      });
    }

    const contact = await Contact.create({
      name,
      email,
      phone,
      city: city || "Bengaluru",
      service: service || "General Query",
      message,
    });

    res.status(201).json({
      success: true,
      message: "Thank you! Your message has been received. We'll get back to you shortly.",
      contact,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all contact submissions (admin)
// @route   GET /api/contact
// @access  Private (Admin)
const getContactSubmissions = async (req, res, next) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: contacts.length, contacts });
  } catch (error) {
    next(error);
  }
};

module.exports = { submitContactForm, getContactSubmissions };
