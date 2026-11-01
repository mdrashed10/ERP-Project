const express = require("express");
const router = express.Router();
const dashboardController = require("../../controllers/dashboardController.js");
const { authenticate } = require("../../middlewere/authmiddlewere.js");


router.get("/allusers", authenticate, dashboardController.getAllUserController);
router.get("/users/:id", authenticate, dashboardController.getSingleUserController);
router.patch("/users/:id/approve", authenticate, dashboardController.approvedUserController);
router.patch("/users/:id/deactivate", authenticate, dashboardController.deactiveUserController);
router.delete("/users/:id", authenticate, dashboardController.deleteUserController);

module.exports = router;