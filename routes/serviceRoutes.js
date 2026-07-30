const express = require("express");
const { 
  getServices, 
  getMyProviderServices, 
  getServiceById, 
  createService, 
  deleteService 
} = require("../controllers/serviceController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").get(getServices).post(protect, authorize("provider", "admin"), createService);
router.route("/my-services").get(protect, authorize("provider", "admin"), getMyProviderServices);
router.route("/:id").get(getServiceById).delete(protect, authorize("provider", "admin"), deleteService);

module.exports = router;
