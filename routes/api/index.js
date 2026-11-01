const express = require("express");
const router = express.Router();


const authroute = require("./authRoute.js")


router.use("/auth", authroute)



module.exports = router;   