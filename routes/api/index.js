const express = require("express");
const router = express.Router();


const authroute = require("./authRoute.js")
const dashboardRoute = require("./dashboardRoute.js")
const taskRoute = require("./taskRoute.js")



router.use("/auth", authroute)
router.use("/dashboard", dashboardRoute) 
router.use("/task", taskRoute) 



module.exports = router;   