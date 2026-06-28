const express = require("express");
const router = express.Router(); 
const testController = require("../../controllers/testController.js")


router.post("/testing", testController)


module.exports = router;