const Service = require("../models/Service");

// @desc    Get all services (with filters for marketplace)
// @route   GET /api/services
// @access  Public
const getServices = async (req, res, next) => {
  try {
    const { category, search, page = 1, limit = 50 } = req.query;
    const query = { isActive: true };

    if (category && category !== "all") {
      query.category = { $regex: category, $options: "i" };
    }

    if (search && search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: "i" };
      query.$or = [
        { title: searchRegex },
        { name: searchRegex },
        { category: searchRegex },
        { description: searchRegex },
        { area: searchRegex },
        { providerName: searchRegex }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Service.countDocuments(query);
    const services = await Service.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: services.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      services,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get services created by logged-in provider ONLY
// @route   GET /api/services/my-services
// @access  Private (Provider/Admin)
const getMyProviderServices = async (req, res, next) => {
  try {
    const services = await Service.find({ provider: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
const getServiceById = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }
    res.status(200).json({ success: true, service });
  } catch (error) {
    next(error);
  }
};

// @desc    Create service (bound to provider user ID)
// @route   POST /api/services
// @access  Private (Admin/Provider)
const createService = async (req, res, next) => {
  try {
    req.body.provider = req.user._id;
    req.body.providerId = req.user._id.toString();
    req.body.providerName = req.user.name;
    req.body.providerEmail = req.user.email;
    req.body.providerAvatar = req.user.avatar || "";
    req.body.name = req.body.title || req.body.name;
    const service = await Service.create(req.body);
    res.status(201).json({ success: true, message: "Service published on server successfully", service });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete service (authorized only for the provider who created it)
// @route   DELETE /api/services/:id
// @access  Private (Admin/Provider)
const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    // Check authorization: provider ownership
    if (service.provider && service.provider.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access or delete services created by another provider",
      });
    }

    await service.deleteOne();
    res.status(200).json({ success: true, message: "Service removed successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  getServices, 
  getMyProviderServices, 
  getServiceById, 
  createService, 
  deleteService 
};
