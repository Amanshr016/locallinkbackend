const express = require("express");
const { createBooking, getMyBookings, getProviderBookings, updateBookingStatus, getAllBookings } = require("../controllers/bookingController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.route("/").get(getMyBookings).post(createBooking);
router.route("/provider").get(authorize("provider", "admin"), getProviderBookings);
router.route("/all").get(authorize("admin"), getAllBookings);
router.route("/:id").put(updateBookingStatus);

module.exports = router;
