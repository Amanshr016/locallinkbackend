const express = require("express");
const { getWorkers, getWorkerById, createWorker, updateWorker } = require("../controllers/workerController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").get(getWorkers).post(protect, authorize("provider", "admin"), createWorker);
router.route("/:id").get(getWorkerById).put(protect, updateWorker);

module.exports = router;
