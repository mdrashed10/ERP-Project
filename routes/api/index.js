const express = require("express");
const router = express.Router();


const authroute = require("./authRoute.js")
const dashboardRoute = require("./dashboardRoute.js")



router.use("/auth", authroute)
router.use("/dashboard", dashboardRoute) 



module.exports = router;   