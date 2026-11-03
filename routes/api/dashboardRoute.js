const express = require("express");
const router = express.Router();
const dashboardController = require("../../controllers/dashboardController.js");
const { authenticate } = require("../../middlewere/authmiddlewere.js");


router.get("/allusers", authenticate, dashboardController.getAllUserController);
router.get("/searchuser", authenticate, dashboardController.searchUserController);
router.get("/Singleuser/:id", authenticate, dashboardController.getSingleUserController);
router.patch("/approveuser/:id", authenticate, dashboardController.approvedUserController);
router.patch("/deactiveuser/:id", authenticate, dashboardController.deactiveUserController);
router.delete("/deleteuser/:id", authenticate, dashboardController.deleteUserController);

module.exports = router;